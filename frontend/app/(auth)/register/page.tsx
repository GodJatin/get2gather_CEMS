import Link from 'next/link';

export default function RegisterRolePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 p-6">
            <div className="w-full max-w-4xl text-center">
                <h1 className="text-4xl font-bold text-white mb-2">Join Get2Gather</h1>
                <p className="text-neutral-400 mb-12">Choose your role to get started</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Student Card */}
                    <Link
                        href="/register/student"
                        className="group relative p-8 rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-blue-500/50 transition-all hover:-translate-y-2"
                    >
                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity" />
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-500/20 flex items-center justify-center text-4xl">
                            🎓
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Student</h2>
                        <p className="text-neutral-400 text-sm">
                            Discover events, book seats, and build your campus profile.
                        </p>
                    </Link>

                    {/* Organizer Card */}
                    <Link
                        href="/register/organizer"
                        className="group relative p-8 rounded-3xl bg-neutral-900/50 border border-white/10 hover:border-purple-500/50 transition-all hover:-translate-y-2"
                    >
                        <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity" />
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-purple-500/20 flex items-center justify-center text-4xl">
                            🎤
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-4">Organizer</h2>
                        <p className="text-neutral-400 text-sm">
                            Create events, manage bookings, and engage with the community.
                        </p>
                    </Link>
                </div>

                <div className="mt-12 text-neutral-500 text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-400 hover:underline">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}
