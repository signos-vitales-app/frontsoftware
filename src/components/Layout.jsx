import Navbar from './navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="p-6 flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;