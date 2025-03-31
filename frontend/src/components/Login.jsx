import React from 'react';
const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden">
        <div
          className="w-1/2 bg-cover bg-center backdrop-blur"
        >
          <div className="h-full flex flex-col justify-end p-8 absolute inset-0 backdrop-blur-3xl text-white items-center"
          style={{
            boxShadow: "0 4px 4px rgba(10,10,10,0.5)",
            backgroundImage: `url('./bbg5.jpg')`, 
            backgroundSize: "cover", 
            backgroundPosition: "center", 
            backgroundRepeat: "no-repeat", 
            zIndex:20,
          }}
          >
            <h1 className="text-4xl font-bold text-white z-10">Adventure awaits you.</h1>
            <p className="mt-4 text-lg text-white z-10">Sign in to connect with nature.</p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-1/2 bg-white p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">
            First time here?{' '}
            <a href="#" className="text-indigo-500 hover:underline">
              Register now
            </a>
          </p>
          <form className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="remember" className="mr-2" />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all">
              Sign In
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Or sign in with</p>
            <div className="flex justify-center gap-4 mt-3">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              </button>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                <img src="https://www.apple.com/favicon.ico" alt="Apple" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
