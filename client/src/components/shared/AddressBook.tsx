'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '@/services/address.service';
import { Address } from '@/types';
import {
    Plus,
    MapPin,
    Trash2,
    Edit,
    CheckCircle2,
    MoreVertical,
    Home,
    Briefcase,
    HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddressForm from './AddressForm';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AddressBook() {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['addresses'],
        queryFn: addressService.getAddresses,
    });

    const addresses = data?.data || [];

    const deleteMutation = useMutation({
        mutationFn: addressService.deleteAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Address deleted');
        },
    });

    const setDefaultMutation = useMutation({
        mutationFn: addressService.setDefault,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            toast.success('Default address updated');
        },
    });

    const handleEdit = (address: Address) => {
        setEditingAddress(address);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingAddress(null);
        setIsFormOpen(true);
    };

    const getAddressIcon = (type: string) => {
        switch (type) {
            case 'home': return <Home className="h-4 w-4" />;
            case 'work': return <Briefcase className="h-4 w-4" />;
            default: return <HelpCircle className="h-4 w-4" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-indigo-500" />
                    Saved Addresses
                </h2>
                <Button
                    onClick={handleAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 h-10"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-48 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
                    ))}
                </div>
            ) : addresses.length === 0 ? (
                <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20">
                    <div className="rounded-full bg-slate-900 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-8 w-8 text-slate-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">No addresses found</h3>
                    <p className="text-slate-500 mb-6">Add an address to speed up your checkout process.</p>
                    <Button onClick={handleAdd} variant="outline" className="border-slate-800 hover:bg-slate-900">
                        Add Your First Address
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div
                            key={address._id}
                            className={`relative group rounded-2xl border transition-all p-5 ${address.isDefault
                                    ? 'bg-indigo-600/5 border-indigo-500/50 ring-1 ring-indigo-500/20'
                                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-slate-800 text-slate-300 border-slate-700 flex gap-1.5 py-1">
                                        {getAddressIcon(address.addressType)}
                                        <span className="capitalize">{address.addressType}</span>
                                    </Badge>
                                    {address.isDefault && (
                                        <Badge className="bg-indigo-600 text-white border-0 py-1">
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                            Default
                                        </Badge>
                                    )}
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                        <DropdownMenuItem onClick={() => handleEdit(address)} className="hover:bg-slate-800 cursor-pointer">
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        {!address.isDefault && (
                                            <DropdownMenuItem onClick={() => setDefaultMutation.mutate(address._id)} className="hover:bg-slate-800 cursor-pointer">
                                                <CheckCircle2 className="mr-2 h-4 w-4" /> Set as Default
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            onClick={() => deleteMutation.mutate(address._id)}
                                            className="text-red-400 hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <div className="space-y-1">
                                <p className="font-bold text-lg text-white">{address.fullName}</p>
                                <div className="text-sm text-slate-400 space-y-0.5">
                                    <p>{address.addressLine}</p>
                                    {address.landmark && <p className="italic">Landmark: {address.landmark}</p>}
                                    <p>{address.city}, {address.state} - {address.postalCode}</p>
                                </div>
                                <div className="pt-3 flex items-center gap-2 text-sm">
                                    <span className="text-slate-500">Phone:</span>
                                    <span className="text-white font-medium">{address.phone}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[550px] bg-slate-950 border-slate-800 p-0 overflow-hidden">
                    <div className="p-6 pb-0">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-white">
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <div className="p-6">
                        <AddressForm
                            initialData={editingAddress}
                            onSuccess={() => {
                                setIsFormOpen(false);
                                queryClient.invalidateQueries({ queryKey: ['addresses'] });
                            }}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
