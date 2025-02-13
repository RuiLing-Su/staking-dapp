import Navigation from "./Navigation";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* 仅显示Logo与“Staking”，去除多余的“DApp”文字 */}
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8" />
          <span className="text-xl font-bold text-white">Staking</span>
        </div>
        <Navigation />
      </div>
    </header>
  );
}