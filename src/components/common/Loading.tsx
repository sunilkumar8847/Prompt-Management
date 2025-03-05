const Loading = () => (
  <div className='fixed inset-0 bg-white/50 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50'>
    <div className='text-center space-y-4'>
      <div className='w-36 h-3 border-2 border-[#021A32] rounded-full relative overflow-hidden'>
        <div className='h-full bg-[#021A32] border-r-2 border-[#021A32] animate-fill'></div>
      </div>
      <div className='text-gray-500 text-lg font-medium'>Loading...</div>
    </div>
    <style>{`
      @keyframes fill {
        0% {
          width: 0%;
        }
        100% {
          width: 100%;
        }
      }
      .animate-fill {
        animation: fill 0.8s linear infinite;
      }
    `}</style>
  </div>
);

export default Loading;
