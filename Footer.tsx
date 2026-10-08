import { Send, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm text-center sm:text-left">
            EMRS Hostel Warden Recruitment — Result &amp; Rank Evaluation Portal
          </p>

          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs">
              Created by Ankit Choudhary
            </span>
            <a
              href="https://t.me/Ankit_choudhary06"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-medium hover:from-sky-400 hover:to-blue-500 transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              <Send className="w-4 h-4" />
              @Ankit_choudhary06
            </a>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-slate-600 text-xs">
          <span>Built with</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          <span>for the EMRS community</span>
        </div>
      </div>
    </footer>
  );
}
