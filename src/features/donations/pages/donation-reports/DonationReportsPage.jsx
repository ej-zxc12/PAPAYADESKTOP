import React from 'react'
import { donationReportsMock } from '../../models/donationsMock'

export default function DonationReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Donation Reports</h1>
      
      <div className="space-y-6">
        {donationReportsMock.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-green-600 text-white p-4">
              <h2 className="text-xl font-semibold">{report.title}</h2>
              <p className="text-green-100">
                {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ₱{report.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {report.donationCount}
                  </p>
                  <p className="text-sm text-gray-600">Donations</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    ₱{report.averageDonation.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Average</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {report.campaigns.length}
                  </p>
                  <p className="text-sm text-gray-600">Campaigns</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Donors</h3>
                  <div className="space-y-3">
                    {report.topDonors.map((donor, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="font-medium text-gray-900">{donor.name}</span>
                        <span className="font-semibold text-green-600">
                          ₱{donor.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Breakdown</h3>
                  <div className="space-y-3">
                    {report.campaigns.map((campaign, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{campaign.name}</span>
                          <span className="font-semibold text-green-600">
                            ₱{campaign.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${campaign.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 text-right">{campaign.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
