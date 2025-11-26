export default function Footer() {
    return (
        <footer className="bg-neutral-900/50 border-t border-white/5 py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-neutral-500 text-sm">
                    © {new Date().getFullYear()} Get2Gather. All rights reserved.
                </div>
                <div className="flex items-center gap-6 text-sm text-neutral-500">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Support</a>
                </div>
            </div>
        </footer>
    );
}
