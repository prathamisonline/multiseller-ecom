'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Address } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { addressService } from '@/services/address.service';
import { toast } from 'sonner';

const addressSchema = z.object({
    fullName: z.string().min(3, 'Full name is required'),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit phone number'),
    alternatePhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid 10-digit phone number').optional().or(z.literal('')),
    addressLine: z.string().min(5, 'Address details are required'),
    landmark: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string().regex(/^\d{6}$/, 'Invalid 6-digit postal code'),
    addressType: z.enum(['home', 'work', 'other']),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
    initialData?: Address | null;
    onSuccess: () => void;
    onCancel: () => void;
}

const STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir'
];

export default function AddressForm({ initialData, onSuccess, onCancel }: AddressFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: initialData ? {
            fullName: initialData.fullName,
            phone: initialData.phone,
            alternatePhone: initialData.alternatePhone || '',
            addressLine: initialData.addressLine,
            landmark: initialData.landmark || '',
            city: initialData.city,
            state: initialData.state,
            postalCode: initialData.postalCode,
            addressType: initialData.addressType,
        } : {
            fullName: '',
            phone: '',
            alternatePhone: '',
            addressLine: '',
            landmark: '',
            city: '',
            state: '',
            postalCode: '',
            addressType: 'home',
        },
    });

    const onSubmit = async (values: AddressFormValues) => {
        setIsLoading(true);
        try {
            if (initialData) {
                await addressService.updateAddress(initialData._id, values);
                toast.success('Address updated successfully');
            } else {
                await addressService.addAddress(values);
                toast.success('Address added successfully');
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-300">Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} className="bg-slate-900 border-slate-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-300">Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="9876543210" {...field} className="bg-slate-900 border-slate-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="addressLine"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-slate-300">House No., Building, Street, Area</FormLabel>
                            <FormControl>
                                <Input placeholder="Flat 402, Galaxy Heights..." {...field} className="bg-slate-900 border-slate-800" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-300">City / District</FormLabel>
                                <FormControl>
                                    <Input placeholder="Mumbai" {...field} className="bg-slate-900 border-slate-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-300">State</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="bg-slate-900 border-slate-800">
                                            <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-slate-900 border-slate-800">
                                        {STATES.map((state) => (
                                            <SelectItem key={state} value={state}>{state}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-300">Pincode</FormLabel>
                                <FormControl>
                                    <Input placeholder="400001" {...field} className="bg-slate-900 border-slate-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="landmark"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-slate-300">Landmark (Optional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Near City Mall" {...field} className="bg-slate-900 border-slate-800" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="addressType"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-slate-300">Address Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="home" id="home" className="border-indigo-500 text-indigo-500" />
                                        <Label htmlFor="home" className="text-slate-300">Home</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="work" id="work" className="border-indigo-500 text-indigo-500" />
                                        <Label htmlFor="work" className="text-slate-300">Work</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="other" id="other" className="border-indigo-500 text-indigo-500" />
                                        <Label htmlFor="other" className="text-slate-300">Other</Label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? 'Update Address' : 'Save Address'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 border-slate-800 hover:bg-slate-900 h-12"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
