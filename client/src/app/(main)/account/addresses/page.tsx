import AddressBook from '@/components/shared/AddressBook';

export default function AddressesPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-white mb-2">My Addresses</h1>
                <p className="text-slate-400">Manage your delivery addresses for a faster checkout experience.</p>
            </div>

            <AddressBook />

            <div className="mt-12 p-6 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-indigo-600/10 p-3 rounded-xl">
                    <svg className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-white font-bold">Why save addresses?</h3>
                    <p className="text-sm text-slate-400">Saving your addresses allows you to bypass the address form during checkout, making your shopping experience smooth and efficient.</p>
                </div>
            </div>
        </div>
    );
}
