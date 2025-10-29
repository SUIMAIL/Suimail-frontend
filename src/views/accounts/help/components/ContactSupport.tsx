export function ContactSupport() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-950 rounded-xl p-6 mt-8 text-white">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-y-5">
        <div>
          <h3 className="text-xl font-semibold mb-1 text-white">
            Still need help?
          </h3>
          <p className="text-blue-100 dark:text-blue-200">
            Our support team is here to assist you with any questions.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-300 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap border dark:border-neutral-700">
            Contact Support
          </button>
          {/* <button className="border border-blue-400 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center space-x-2">
            <ExternalLink className="w-4 h-4" />
            <span>Documentation</span>
          </button> */}
        </div>
      </div>
    </div>
  )
}
