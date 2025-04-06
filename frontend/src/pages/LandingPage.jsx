const LandingPage = () => {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          Welcome to FitClub
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your ultimate fitness companion to achieve your goals.
        </p>
        <div className="space-x-4">
          <a
            href="/signup"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400"
          >
            Login
          </a>
        </div>
      </div>
    );
  };

  export default LandingPage;