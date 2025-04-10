"use client"
import { useState } from "react"
import type React from "react"

import Image from "next/image"

interface Message {
  role: string
  content: string
}

interface Product {
  product_name: string
  image_url: string
  price: number
  category: string
}

interface ScraperResponse {
  data: {
    products: Product[]
  }
  message: string
}

export default function Home() {
  const [url, setUrl] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [response, setResponse] = useState<Message[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResponse([])
    setProducts([])

    try {
      // Make a POST request to your API route
      const apiResponse = await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.message || "Failed to scrape data")
      }

      const result: ScraperResponse = await apiResponse.json()

      // Add the response to the messages
      setResponse([{ role: "system", content: result.message || "Scraping completed successfully" }])

      // Set the products if available
      if (result.data && result.data.products) {
        setProducts(result.data.products)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="url" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Enter URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : "Submit URL"}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Response</h2>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {response.map((msg, index) => (
                <div key={index} className="prose dark:prose-invert max-w-none">
                  {msg.content}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Display */}
                {typeof window !== 'undefined' && products.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      Products Found ({products.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.map((product, index) => (
                <div
                  key={index}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col space-y-3">
                    {product.image_url && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.product_name}
                          fill
                          className="object-contain rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=200&width=200"
                          }}
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{product.product_name}</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        ${product.price.toFixed(2)}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm rounded-full">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
