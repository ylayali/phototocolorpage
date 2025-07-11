"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (background: "mindful" | "plain") => {
    if (!image) {
      setError("Please select an image.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultImage(null);

    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", name);
    formData.append("background", background);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unknown error occurred.");
      }

      const data = await response.json();
      setResultImage(data.imageUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Coloring Page Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Transform your photos into beautiful coloring pages with AI magic
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-center font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
            <div>
              <label htmlFor="image" className="block text-lg font-semibold text-gray-900 mb-3">
                📸 Upload Your Photo
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-50 file:to-blue-50 file:text-purple-700 hover:file:from-purple-100 hover:file:to-blue-100 file:transition-all file:duration-200 border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple-400 transition-colors"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Choose a clear photo for the best results
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-lg font-semibold text-gray-900 mb-3">
                ✏️ Add a Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name to include on the coloring page"
                className="block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
              />
            </div>

            <div>
              <p className="block text-lg font-semibold text-gray-900 mb-4">
                🎨 Choose Your Style
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleSubmit("mindful")}
                  disabled={loading}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
                >
                  <div className="relative z-10">
                    <div className="text-lg mb-1">🧘 Mindful Background</div>
                    <div className="text-sm opacity-90">Abstract patterns for relaxation</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSubmit("plain")}
                  disabled={loading}
                  className="group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg"
                >
                  <div className="relative z-10">
                    <div className="text-lg mb-1">⚪ Plain Background</div>
                    <div className="text-sm opacity-90">Clean and simple design</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </div>
            </div>
          </form>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Creating Your Masterpiece</h3>
            <p className="text-gray-600">This usually takes 30-60 seconds...</p>
          </div>
        )}

        {resultImage && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🎉 Your Coloring Page is Ready!</h2>
            <div className="mb-6">
              <img
                src={resultImage}
                alt="Generated coloring page"
                className="max-w-full h-auto rounded-xl shadow-lg mx-auto border-4 border-gray-100"
              />
            </div>
            <a
              href={resultImage}
              download="coloring-page.png"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Your Coloring Page
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
