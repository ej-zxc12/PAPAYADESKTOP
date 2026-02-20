export const websiteRoutes = {
  home: '/home',
  aboutUs: {
    ourStory: '/about-us/our-story',
    missionVision: '/about-us/mission-vision',
    organizationalChart: '/about-us/organizational-chart',
    partnersSponsors: '/about-us/partners-sponsors'
  }
}

export const donationsRoutes = {
  onlineDonations: '/donations/online-donations',
  donationReports: '/donations/donation-reports'
}

export const messagesRoutes = {
  inbox: '/messages'
}

export const mediaLibraryRoutes = {
  library: '/media-library'
}

export const settingsRoutes = {
  general: '/settings',
  donations: '/settings/donations',
  notifications: '/settings/notifications',
  appearance: '/settings/appearance'
}

export const featureRoutes = {
  website: websiteRoutes,
  donations: donationsRoutes,
  messages: messagesRoutes,
  mediaLibrary: mediaLibraryRoutes,
  settings: settingsRoutes,
  // Existing features
  alumni: '/alumni',
  news: '/news',
  sf10: '/sf10'
}
