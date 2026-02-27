const admin = require('firebase-admin')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { logger } = require('firebase-functions')
const { RRule } = require('rrule')

admin.initializeApp()

function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value.toDate === 'function') return value.toDate()
  return null
}

function safeParseRRule(rruleString, dtstart) {
  const raw = String(rruleString || '').trim()
  if (!raw) return null

  try {
    // Ensure DTSTART exists; rrule library uses `dtstart` option.
    return RRule.fromString(raw).clone({ dtstart })
  } catch {
    try {
      return RRule.fromString(raw)
    } catch {
      return null
    }
  }
}

exports.autoPostDueEvents = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'UTC',
    retryCount: 0,
    memory: '256MiB',
  },
  async () => {
    const db = admin.firestore()
    const now = new Date()

    // Query across all users' events.
    // Requires an index for: status + nextRunAt.
    const snap = await db
      .collectionGroup('events')
      .where('status', '==', 'scheduled')
      .where('nextRunAt', '<=', admin.firestore.Timestamp.fromDate(now))
      .limit(200)
      .get()

    if (snap.empty) return

    let processed = 0

    // Process sequentially to keep behavior simple and safe.
    for (const docSnap of snap.docs) {
      const ref = docSnap.ref

      try {
        await db.runTransaction(async (tx) => {
          const latest = await tx.get(ref)
          if (!latest.exists) return

          const data = latest.data() || {}
          if (data.status !== 'scheduled') return

          const nextRunAt = toDate(data.nextRunAt)
          if (!nextRunAt || nextRunAt.getTime() > now.getTime()) return

          const startAt = toDate(data.startAt)
          const rrule = String(data.rrule || '').trim()

          const patch = {
            lastPostedAt: admin.firestore.Timestamp.fromDate(now),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }

          if (rrule) {
            const rule = safeParseRRule(rrule, startAt || nextRunAt)
            const next = rule ? rule.after(now, false) : null
            if (next) {
              patch.nextRunAt = admin.firestore.Timestamp.fromDate(next)
              patch.status = 'scheduled'
            } else {
              patch.status = 'posted'
              patch.postedAt = admin.firestore.Timestamp.fromDate(now)
            }
          } else {
            patch.status = 'posted'
            patch.postedAt = admin.firestore.Timestamp.fromDate(now)
          }

          tx.update(ref, patch)
        })

        processed += 1
      } catch (e) {
        logger.error('autoPostDueEvents failed for doc', ref.path, e)
      }
    }

    logger.info('autoPostDueEvents processed', processed)
  },
)
