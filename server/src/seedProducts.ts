import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/userModel';
import Product from './models/productModel';

dotenv.config();

// Home Decor and Gadgets Products
const productData = [
    // ============ HOME DECOR ============
    {
        name: 'Minimalist Ceramic Vase Set',
        description: 'Elegant set of 3 handcrafted ceramic vases in nordic style. Perfect for dried flowers, pampas grass, or as standalone decor pieces.',
        price: 2999,
        mrp: 4499,
        stock: 50,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800',
            'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800'
        ],
        attributes: [{ key: 'Material', value: 'Ceramic' }, { key: 'Set', value: '3 Pieces' }]
    },
    {
        name: 'Luxe Velvet Throw Pillows',
        description: 'Premium velvet cushion covers with gold zipper. Soft, plush, and perfect for adding a touch of luxury to any sofa or bed.',
        price: 1899,
        mrp: 2999,
        stock: 80,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=800',
            'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800'
        ],
        attributes: [{ key: 'Material', value: 'Velvet' }, { key: 'Size', value: '18x18 inches' }]
    },
    {
        name: 'Macramé Wall Hanging - Bohemian',
        description: 'Handwoven macramé wall art with intricate patterns. Natural cotton cord on driftwood. Boho-chic statement piece.',
        price: 3499,
        mrp: 4999,
        stock: 35,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800',
            'https://images.unsplash.com/photo-1615529162924-f8605388461d?w=800'
        ],
        attributes: [{ key: 'Size', value: '24x36 inches' }, { key: 'Material', value: 'Natural Cotton' }]
    },
    {
        name: 'Modern Abstract Canvas Art',
        description: 'Large-scale abstract painting on premium canvas. Gallery-wrapped with hidden staples. Ready to hang with hardware included.',
        price: 7999,
        mrp: 12999,
        stock: 20,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800',
            'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800'
        ],
        attributes: [{ key: 'Size', value: '36x48 inches' }, { key: 'Style', value: 'Abstract' }]
    },
    {
        name: 'Rattan Pendant Light',
        description: 'Hand-woven natural rattan pendant lamp. Creates beautiful shadow patterns. Perfect for living room, bedroom, or dining area.',
        price: 4599,
        mrp: 6999,
        stock: 25,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800',
            'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800'
        ],
        attributes: [{ key: 'Material', value: 'Natural Rattan' }, { key: 'Diameter', value: '40cm' }]
    },
    {
        name: 'Marble Effect Table Lamp',
        description: 'Elegant table lamp with marble-effect base and linen shade. Touch-sensitive dimmer. Warm ambient lighting.',
        price: 3299,
        mrp: 4999,
        stock: 40,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
            'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800'
        ],
        attributes: [{ key: 'Base', value: 'Marble Effect' }, { key: 'Shade', value: 'Linen' }]
    },
    {
        name: 'Geometric Metal Wall Shelf',
        description: 'Modern hexagonal floating shelves for displaying plants and collectibles. Black matte finish with gold accents.',
        price: 2499,
        mrp: 3999,
        stock: 45,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800',
            'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800'
        ],
        attributes: [{ key: 'Material', value: 'Metal' }, { key: 'Set', value: '3 Pieces' }]
    },
    {
        name: 'Handwoven Jute Area Rug',
        description: '100% natural jute area rug with geometric pattern. Eco-friendly and durable. Perfect for living rooms and bedrooms.',
        price: 5999,
        mrp: 8999,
        stock: 30,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800',
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'
        ],
        attributes: [{ key: 'Size', value: '5x8 feet' }, { key: 'Material', value: '100% Jute' }]
    },
    {
        name: 'Aromatic Candle Gift Set',
        description: 'Luxury soy wax candles in 4 signature scents: Lavender, Vanilla, Sandalwood, and Ocean Breeze. 40+ hours burn time each.',
        price: 1999,
        mrp: 2999,
        stock: 100,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800',
            'https://images.unsplash.com/photo-1608181831718-c9ffd8fa24c4?w=800'
        ],
        attributes: [{ key: 'Wax', value: 'Soy' }, { key: 'Set', value: '4 Candles' }]
    },
    {
        name: 'Monstera Artificial Plant',
        description: 'Lifelike artificial Monstera plant in ceramic pot. No maintenance required. Adds tropical vibes to any space.',
        price: 1499,
        mrp: 2499,
        stock: 60,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800',
            'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'
        ],
        attributes: [{ key: 'Height', value: '60cm' }, { key: 'Type', value: 'Artificial' }]
    },
    {
        name: 'Vintage Mirror with Gold Frame',
        description: 'Ornate antique-style wall mirror with gold-finished frame. Adds depth and elegance to any room.',
        price: 6999,
        mrp: 9999,
        stock: 15,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800',
            'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800'
        ],
        attributes: [{ key: 'Frame', value: 'Gold Finish' }, { key: 'Shape', value: 'Oval' }]
    },
    {
        name: 'Woven Storage Baskets Set',
        description: 'Natural seagrass storage baskets in 3 sizes. Perfect for organizing blankets, toys, or plants. Handcrafted.',
        price: 2299,
        mrp: 3499,
        stock: 55,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
            'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'
        ],
        attributes: [{ key: 'Material', value: 'Seagrass' }, { key: 'Set', value: '3 Baskets' }]
    },
    {
        name: 'Bohemian Dreamcatcher',
        description: 'Large handmade dreamcatcher with feathers and beads. Natural wooden ring and cotton thread. Perfect wall accent.',
        price: 899,
        mrp: 1499,
        stock: 70,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800',
            'https://images.unsplash.com/photo-1563865436874-9aef32095fad?w=800'
        ],
        attributes: [{ key: 'Diameter', value: '30cm' }, { key: 'Length', value: '80cm' }]
    },
    {
        name: 'Minimalist Wall Clock',
        description: 'Silent sweep mechanism wall clock with clean Scandinavian design. Natural wood frame with white face.',
        price: 1799,
        mrp: 2499,
        stock: 45,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800',
            'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800'
        ],
        attributes: [{ key: 'Diameter', value: '30cm' }, { key: 'Material', value: 'Wood & Glass' }]
    },
    {
        name: 'Terracotta Planter Collection',
        description: 'Set of 5 terracotta planters in various sizes. Drainage holes included. Perfect for succulents and herbs.',
        price: 1299,
        mrp: 1999,
        stock: 65,
        category: 'Home Decor',
        images: [
            'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
            'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800'
        ],
        attributes: [{ key: 'Material', value: 'Terracotta' }, { key: 'Set', value: '5 Planters' }]
    },

    // ============ GADGETS ============
    {
        name: 'Smart LED Strip Lights 10M',
        description: 'WiFi-enabled RGB LED strip with 16 million colors. Voice control with Alexa/Google. Music sync and app control.',
        price: 1999,
        mrp: 3499,
        stock: 100,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
            'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800'
        ],
        attributes: [{ key: 'Length', value: '10 meters' }, { key: 'Control', value: 'WiFi + App' }]
    },
    {
        name: 'Portable Power Station 500W',
        description: 'Compact power station with 518Wh capacity. 4 USB ports, 2 AC outlets. Perfect for camping and emergencies.',
        price: 32999,
        mrp: 44999,
        stock: 20,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800',
            'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'
        ],
        attributes: [{ key: 'Capacity', value: '518Wh' }, { key: 'Output', value: '500W' }]
    },
    {
        name: 'Smart Video Doorbell Pro',
        description: '2K HDR video doorbell with head-to-toe view. Two-way audio, night vision, and package detection.',
        price: 8999,
        mrp: 12999,
        stock: 35,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'
        ],
        attributes: [{ key: 'Resolution', value: '2K HDR' }, { key: 'Power', value: 'Battery/Wired' }]
    },
    {
        name: 'Wireless Charging Station 3-in-1',
        description: 'Charge your phone, watch, and earbuds simultaneously. 15W fast charging. Sleek minimalist design.',
        price: 3499,
        mrp: 4999,
        stock: 50,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800',
            'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'
        ],
        attributes: [{ key: 'Power', value: '15W Fast Charge' }, { key: 'Devices', value: '3 Simultaneous' }]
    },
    {
        name: 'Smart Air Purifier HEPA',
        description: 'True HEPA air purifier with smart sensors. Auto mode adjusts fan speed based on air quality. Covers 500 sq ft.',
        price: 12999,
        mrp: 17999,
        stock: 25,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
            'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800'
        ],
        attributes: [{ key: 'Filter', value: 'True HEPA H13' }, { key: 'Coverage', value: '500 sq ft' }]
    },
    {
        name: 'Mini Projector 4K Supported',
        description: 'Portable projector with native 1080p and 4K support. WiFi streaming, built-in speakers. 120-inch display.',
        price: 18999,
        mrp: 26999,
        stock: 30,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
            'https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=800'
        ],
        attributes: [{ key: 'Resolution', value: '1080p Native' }, { key: 'Brightness', value: '800 ANSI Lumens' }]
    },
    {
        name: 'Electric Screwdriver Kit 48-in-1',
        description: 'Precision electric screwdriver with 48 magnetic bits. LED light, USB-C charging. Perfect for electronics repair.',
        price: 2499,
        mrp: 3999,
        stock: 60,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800',
            'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800'
        ],
        attributes: [{ key: 'Bits', value: '48 Pieces' }, { key: 'Charging', value: 'USB-C' }]
    },
    {
        name: 'Smart Water Bottle with Temp Display',
        description: 'Stainless steel smart water bottle with LED temperature display. Reminds you to stay hydrated. Keeps drinks hot/cold.',
        price: 1299,
        mrp: 1999,
        stock: 80,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800',
            'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800'
        ],
        attributes: [{ key: 'Capacity', value: '500ml' }, { key: 'Material', value: 'Stainless Steel' }]
    },
    {
        name: 'Magnetic Levitating Speaker',
        description: 'Floating Bluetooth speaker with 360° sound. Magnetic levitation creates stunning visual effect. 8-hour battery.',
        price: 4999,
        mrp: 7999,
        stock: 25,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800',
            'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'
        ],
        attributes: [{ key: 'Battery', value: '8 hours' }, { key: 'Connectivity', value: 'Bluetooth 5.0' }]
    },
    {
        name: 'Smart WiFi Plug 4-Pack',
        description: 'Voice-controlled smart plugs compatible with Alexa and Google. Energy monitoring, scheduling, and away mode.',
        price: 1999,
        mrp: 2999,
        stock: 100,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=800',
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'
        ],
        attributes: [{ key: 'Pack', value: '4 Plugs' }, { key: 'Features', value: 'Energy Monitoring' }]
    },
    {
        name: 'Pocket Thermal Printer',
        description: 'Portable mini printer for notes, photos, and labels. No ink needed - uses thermal paper. Bluetooth connectivity.',
        price: 2999,
        mrp: 4499,
        stock: 45,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800',
            'https://images.unsplash.com/photo-1563884072595-24d1c730defc?w=800'
        ],
        attributes: [{ key: 'Type', value: 'Thermal' }, { key: 'Connectivity', value: 'Bluetooth' }]
    },
    {
        name: 'Digital Drawing Pad 10-inch',
        description: 'LCD writing tablet for notes and drawings. One-button erase. Perfect for kids and adults. 50,000+ erases.',
        price: 999,
        mrp: 1499,
        stock: 75,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1588702547923-7093a6c3ba33?w=800',
            'https://images.unsplash.com/photo-1609921205586-7e8a57516512?w=800'
        ],
        attributes: [{ key: 'Size', value: '10 inches' }, { key: 'Battery', value: '2+ years' }]
    },
    {
        name: 'Smart Fingerprint Padlock',
        description: 'Keyless padlock with biometric fingerprint scanner. Stores 20 fingerprints. USB rechargeable, waterproof.',
        price: 1499,
        mrp: 2499,
        stock: 55,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1558002038-1055907df827?w=800',
            'https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800'
        ],
        attributes: [{ key: 'Fingerprints', value: 'Up to 20' }, { key: 'Rating', value: 'IP65 Waterproof' }]
    },
    {
        name: 'Car Phone Mount with Wireless Charging',
        description: 'Auto-clamping phone mount with 15W wireless charging. Air vent and dashboard mount included.',
        price: 1799,
        mrp: 2999,
        stock: 65,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1605464315542-bda3e2f4e605?w=800',
            'https://images.unsplash.com/photo-1533310266094-8898a03807dd?w=800'
        ],
        attributes: [{ key: 'Charging', value: '15W Wireless' }, { key: 'Mount', value: 'Air Vent + Dashboard' }]
    },
    {
        name: 'UV Phone Sanitizer Box',
        description: 'UV-C light sanitizer for phones, keys, and accessories. Kills 99.9% of germs in 10 minutes. Aromatherapy function.',
        price: 1299,
        mrp: 1999,
        stock: 50,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800',
            'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800'
        ],
        attributes: [{ key: 'Technology', value: 'UV-C' }, { key: 'Time', value: '10 minutes' }]
    },
    {
        name: 'Mechanical Keyboard Mini 60%',
        description: 'Compact 60% mechanical keyboard with RGB backlight. Hot-swappable switches. USB-C and Bluetooth.',
        price: 4999,
        mrp: 6999,
        stock: 40,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=800',
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800'
        ],
        attributes: [{ key: 'Layout', value: '60%' }, { key: 'Switches', value: 'Hot-swappable' }]
    },
    {
        name: 'Smart Sleep Tracker',
        description: 'Under-mattress sleep sensor. Tracks sleep stages, heart rate, and breathing. No wearable needed.',
        price: 6999,
        mrp: 9999,
        stock: 30,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800',
            'https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=800'
        ],
        attributes: [{ key: 'Tracking', value: 'Sleep, Heart Rate, Breathing' }, { key: 'Connectivity', value: 'WiFi' }]
    },
    {
        name: 'Portable Neck Fan',
        description: 'Hands-free wearable neck fan with 3 speeds. Bladeless design, 8-hour battery. Perfect for summer.',
        price: 899,
        mrp: 1499,
        stock: 90,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800',
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'
        ],
        attributes: [{ key: 'Battery', value: '8 hours' }, { key: 'Design', value: 'Bladeless' }]
    },
    {
        name: 'Anti-Gravity Humidifier',
        description: 'Water droplet levitation humidifier with ambient light. Quiet operation, 300ml tank. Mesmerizing visual effect.',
        price: 2499,
        mrp: 3999,
        stock: 35,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800',
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
        ],
        attributes: [{ key: 'Capacity', value: '300ml' }, { key: 'Light', value: 'Ambient LED' }]
    },
    {
        name: 'Galaxy Star Projector',
        description: 'Nebula and star projection with Bluetooth speaker. Timer function, 15 light modes. Transform any room into space.',
        price: 2999,
        mrp: 4499,
        stock: 45,
        category: 'Gadgets',
        images: [
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
            'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800'
        ],
        attributes: [{ key: 'Modes', value: '15 Light Modes' }, { key: 'Features', value: 'Bluetooth Speaker' }]
    },
];

const seedProducts = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('MongoDB Connected...');

        // Find the seller user
        const seller = await User.findOne({ email: 'pratham@gmail.com' });

        if (!seller) {
            console.error('❌ Seller with email pratham@gmail.com not found!');
            process.exit(1);
        }

        console.log(`✅ Found seller: ${seller.name} (${seller.email})`);

        // Create products
        console.log('\n📦 Creating Home Decor & Gadgets products...\n');

        let homeDecorCount = 0;
        let gadgetsCount = 0;

        for (const productInfo of productData) {
            try {
                const product = await Product.create({
                    ...productInfo,
                    seller: seller._id,
                    status: 'approved',
                    archived: false,
                });

                if (productInfo.category === 'Home Decor') homeDecorCount++;
                if (productInfo.category === 'Gadgets') gadgetsCount++;

                console.log(`   ✓ [${product.category}] ${product.name}`);
            } catch (err: any) {
                console.log(`   ✗ Failed: ${productInfo.name} - ${err.message}`);
            }
        }

        console.log('\n----------------------------------');
        console.log(`✅ Home Decor products added: ${homeDecorCount}`);
        console.log(`✅ Gadgets products added: ${gadgetsCount}`);
        console.log(`✅ Total new products: ${homeDecorCount + gadgetsCount}`);
        console.log('----------------------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedProducts();
