import { BiSearch } from "react-icons/bi";
import { AiOutlineBell, AiOutlineMessage } from "react-icons/ai";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 h-16 shadow-md bg-white fixed w-full">
      <h1 className="font-semibold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <BiSearch className="absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            placeholder="Search for anything here..."
            className="pl-10 pr-4 py-2 border rounded-md w-72 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <AiOutlineBell className="text-lg cursor-pointer" />
        <AiOutlineMessage className="text-lg cursor-pointer" />
        <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer">
          G
        </div>
      </div>
    </header>
  );
};

export default Header;
