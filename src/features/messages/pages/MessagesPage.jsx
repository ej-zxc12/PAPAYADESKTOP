import React, { useState } from 'react'
import { messagesMock } from '../../models/messagesMock'

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')

  const handleMessageClick = (message) => {
    setSelectedMessage(message)
    setReplyText('')
  }

  const handleReply = () => {
    if (selectedMessage && replyText.trim()) {
      console.log('Reply sent:', { messageId: selectedMessage.id, replyText })
      // Handle reply submission
      setReplyText('')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Inbox</h2>
              <p className="text-sm text-gray-600">
                {messagesMock.filter(m => !m.read).length} unread messages
              </p>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {messagesMock.map((message) => (
                <div
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                  } ${!message.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900 truncate">
                      {message.fromName}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {new Date(message.receivedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mb-1">
                    {message.subject || 'No subject'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {message.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {selectedMessage.subject || 'No Subject'}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>From: {selectedMessage.fromName}</span>
                      <span>{selectedMessage.fromEmail}</span>
                      <span>{new Date(selectedMessage.receivedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedMessage.read ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedMessage.read ? 'Read' : 'Unread'}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.body}</p>
                </div>

                {selectedMessage.replied && selectedMessage.replyText && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Your Reply:</h4>
                    <p className="text-green-700">{selectedMessage.replyText}</p>
                    <p className="text-xs text-green-600 mt-2">
                      Replied on {new Date(selectedMessage.repliedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Reply to this message:</h4>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Type your reply..."
                  />
                  <button
                    onClick={handleReply}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-400">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">No message selected</p>
                <p className="text-gray-600">Select a message from the inbox to view and reply</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
