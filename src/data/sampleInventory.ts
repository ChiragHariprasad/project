import { InventoryItem } from '../types';

// Sample inventory data
const sampleInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Premium Headphones',
    description: 'Noise-cancelling wireless headphones with premium sound quality',
    price: 199.99,
    stock: 15,
    image: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Electronics',
    nextRestock: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Track your fitness and stay connected with this sleek smart watch',
    price: 249.99,
    stock: 8,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Electronics',
    nextRestock: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    name: 'Bluetooth Speaker',
    description: 'Portable waterproof bluetooth speaker with rich bass',
    price: 89.99,
    stock: 22,
    image: 'https://images.pexels.com/photos/575696/pexels-photo-575696.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Electronics',
    nextRestock: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    name: 'Ergonomic Office Chair',
    description: 'Comfortable ergonomic chair with lumbar support for long work hours',
    price: 189.99,
    stock: 5,
    image: 'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Furniture',
    nextRestock: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    name: 'Premium Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 129.99,
    stock: 12,
    image: 'https://images.pexels.com/photos/4350055/pexels-photo-4350055.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Appliances',
    nextRestock: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    name: 'Yoga Mat',
    description: 'Non-slip eco-friendly yoga mat with carrying strap',
    price: 39.99,
    stock: 30,
    image: 'https://images.pexels.com/photos/4662294/pexels-photo-4662294.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Fitness',
    nextRestock: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '7',
    name: 'Gaming Laptop',
    description: 'High-performance gaming laptop with RGB keyboard and RTX graphics',
    price: 1299.99,
    stock: 5,
    image: 'https://images.pexels.com/photos/777001/pexels-photo-777001.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Electronics',
    nextRestock: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '8',
    name: 'Air Purifier',
    description: 'Smart air purifier with HEPA filter and air quality monitor',
    price: 199.99,
    stock: 15,
    image: 'https://images.pexels.com/photos/4429561/pexels-photo-4429561.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Appliances',
    nextRestock: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '9',
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells from 5-52.5 lbs',
    price: 299.99,
    stock: 8,
    image: 'https://images.pexels.com/photos/4397840/pexels-photo-4397840.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Fitness',
    nextRestock: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '10',
    name: 'Standing Desk',
    description: 'Electric height-adjustable standing desk with memory presets',
    price: 449.99,
    stock: 10,
    image: 'https://images.pexels.com/photos/7054511/pexels-photo-7054511.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Furniture',
    nextRestock: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '11',
    name: 'Robot Vacuum',
    description: 'Smart robot vacuum with mapping and self-emptying base',
    price: 599.99,
    stock: 7,
    image: 'https://images.pexels.com/photos/4087992/pexels-photo-4087992.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Appliances',
    nextRestock: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '12',
    name: 'Meditation Cushion Set',
    description: 'Comfortable meditation cushion set with mat and bolster',
    price: 79.99,
    stock: 20,
    image: 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Fitness',
    nextRestock: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default sampleInventory;