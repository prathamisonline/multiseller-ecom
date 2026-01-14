'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Plus,
    Trash2,
    Image as ImageIcon,
    Tag,
    IndianRupee,
    Layers,
    Info,
    Loader2,
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Product } from '@/types';
import { toast } from 'sonner';

const productSchema = z.object({
    name: z.string().min(5, 'Product name must be at least 5 characters'),
    description: z.string().min(20, 'Please provide a detailed description (min 20 chars)'),
    price: z.coerce.number().min(1, 'Price must be at least 1'),
    mrp: z.coerce.number().min(1, 'MRP must be at least 1'),
    stock: z.coerce.number().min(0, 'Stock cannot be negative'),
    category: z.string().min(1, 'Category is required'),
    images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
    attributes: z.array(z.object({
        name: z.string().min(1, 'Attribute name is required'),
        value: z.string().min(1, 'Attribute value is required'),
    })),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
    initialData?: Product;
    onSubmit: (values: ProductFormValues) => Promise<void>;
    isSubmitting?: boolean;
}

export default function ProductForm({ initialData, onSubmit, isSubmitting }: ProductFormProps) {
    const [newImageUrl, setNewImageUrl] = useState('');

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            price: initialData?.price || 0,
            mrp: initialData?.mrp || 0,
            stock: initialData?.stock || 0,
            category: initialData?.category || '',
            images: initialData?.images || [],
            attributes: initialData?.attributes?.map(a => ({ name: a.name, value: a.value })) || [],
        },
    });

    const { fields: attributeFields, append: appendAttribute, remove: removeAttribute } = useFieldArray({
        control: form.control,
        name: 'attributes',
    });

    const addImage = () => {
        if (!newImageUrl) return;
        try {
            z.string().url().parse(newImageUrl);
            const currentImages = form.getValues('images');
            form.setValue('images', [...currentImages, newImageUrl]);
            setNewImageUrl('');
        } catch {
            toast.error('Please enter a valid image URL');
        }
    };

    const removeImage = (index: number) => {
        const currentImages = form.getValues('images');
        form.setValue('images', currentImages.filter((_, i) => i !== index));
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6">
                            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                                <Info className="w-5 h-5" />
                                General Information
                            </div>

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Nike Air Max 270..." {...field} className="bg-slate-950 border-slate-800 h-12" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300">Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe your product features, materials, and benefits..."
                                                className="min-h-[200px] bg-slate-950 border-slate-800 resize-none"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </section>

                        <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6">
                            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                                <ImageIcon className="w-5 h-5" />
                                Product Images
                            </div>

                            <div className="flex gap-4">
                                <Input
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    placeholder="Paste image URL here..."
                                    className="bg-slate-950 border-slate-800 h-12"
                                />
                                <Button type="button" onClick={addImage} className="bg-slate-800 hover:bg-slate-700 h-12">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                {form.watch('images').map((url, idx) => (
                                    <div key={idx} className="relative group aspect-square rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                                        <img src={url} alt="" className="object-cover w-full h-full" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {form.formState.errors.images && (
                                <p className="text-sm font-medium text-red-500">{form.formState.errors.images.message}</p>
                            )}
                        </section>

                        <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                                    <Layers className="w-5 h-5" />
                                    Specifications / Attributes
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => appendAttribute({ name: '', value: '' })}
                                    className="border-slate-800"
                                >
                                    <Plus className="w-3 h-3 mr-2" /> Add Attribute
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {attributeFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-4 items-start">
                                        <FormField
                                            control={form.control}
                                            name={`attributes.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder="Color / Size / Weight" {...field} className="bg-slate-950 border-slate-800" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`attributes.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input placeholder="Black / XL / 500g" {...field} className="bg-slate-950 border-slate-800" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeAttribute(index)}
                                            className="text-slate-500 hover:text-red-500"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                {attributeFields.length === 0 && (
                                    <p className="text-center py-4 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl">
                                        No specifications added. Click "Add Attribute" to include details like size, color, etc.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Area: Pricing & Category */}
                    <div className="space-y-8">
                        <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6">
                            <div className="flex items-center gap-2 text-green-500 font-bold mb-4">
                                <IndianRupee className="w-5 h-5" />
                                Pricing & Stock
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-400">Selling Price (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-slate-950 border-slate-800 h-12 text-lg font-bold" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="mrp"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-400">MRP (₹)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-slate-950 border-slate-800 h-12" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-400">Inventory Stock</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} className="bg-slate-950 border-slate-800 h-12" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </section>

                        <section className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6">
                            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                                <Tag className="w-5 h-5" />
                                Categorization
                            </div>

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-400">Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-slate-950 border-slate-800 h-12 capitalize">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                <SelectItem value="electronics">Electronics</SelectItem>
                                                <SelectItem value="fashion">Fashion</SelectItem>
                                                <SelectItem value="footwear">Footwear</SelectItem>
                                                <SelectItem value="accessories">Accessories</SelectItem>
                                                <SelectItem value="home-decor">Home Decor</SelectItem>
                                                <SelectItem value="fitness">Fitness / Health</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </section>

                        <div className="pt-8 flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 h-14 text-lg font-bold shadow-xl shadow-indigo-600/20"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Saving Changes...
                                    </>
                                ) : (
                                    initialData ? 'Update Product' : 'List Product'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full text-slate-500 hover:text-white"
                                onClick={() => window.history.back()}
                            >
                                Discard Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
