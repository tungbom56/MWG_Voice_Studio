import React from 'react';
import { MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 py-8 border-t border-mwg-gold/30 bg-[#002244]">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-mwg-gold font-bold text-lg mb-2">Developed by Nguyễn Thanh Tùng</p>
        <p className="text-gray-300 italic mb-4">"Mang đến giải pháp AI tối ưu cho cộng đồng truyền thông MWG"</p>
        
        <div className="flex justify-center">
          <a 
            href="https://line.me/ti/p/DVe20CgdDO" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 bg-mwg-blue border border-mwg-gold rounded-full px-6 py-2 transition hover:bg-mwg-gold hover:text-mwg-blue cursor-pointer group"
          >
            <MessageCircle size={20} className="text-mwg-gold group-hover:text-mwg-blue transition-colors" />
            <span className="font-medium">Hỗ trợ qua Line</span>
          </a>
        </div>
      </div>
    </footer>
  );
};