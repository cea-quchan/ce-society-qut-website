import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface UserMenuProps {
  username: string;
  avatar?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ username, avatar }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] text-[#00ff99] rounded-lg hover:bg-[#2a2a2a] transition-colors"
      >
        {avatar ? (
          <Image
            src={avatar}
            alt={username}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#00ff99] flex items-center justify-center text-black font-bold">
            {username.charAt(0).toUpperCase()}
          </div>
        )}
        <span>{username}</span>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full right-0 mt-2 w-48 bg-[#1a1a1a] rounded-lg shadow-lg py-2"
        >
          <a
            href="/profile"
            className="block px-4 py-2 text-[#00ff99] hover:bg-[#2a2a2a]"
          >
            پروفایل
          </a>
          <a
            href="/settings"
            className="block px-4 py-2 text-[#00ff99] hover:bg-[#2a2a2a]"
          >
            تنظیمات
          </a>
          <button
            onClick={() => {
              // Implement logout functionality
              console.log('Logging out...');
            }}
            className="block w-full text-right px-4 py-2 text-[#00ff99] hover:bg-[#2a2a2a]"
          >
            خروج
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default UserMenu; 