const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-[#211F26]">
      <div
        className="w-12 h-12 rounded-full animate-spin"
        style={{
          background: 'conic-gradient(from 0deg, #FF7DFD, #A36EFF, #FF7DFD)',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))'
        }}
      />
    </div>
  );
};

export default LoadingSpinner;
