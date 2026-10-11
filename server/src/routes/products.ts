import { z } from 'zod';
import { requireAdmin } from '../middleware/auth';

import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';

export const productsRouter = Router();

const ProductInputSchema = z.object({
  name: z.string().trim().min(1).max(150),
  slug: z.string().trim().min(1).max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.enum(['Bouquets', 'Keychains', 'Phone charms', 'Other']),
  material: z.string().trim().min(1).max(100),
  price: z.number().finite().min(0),
  description: z.string().trim().min(1).max(2000),
  options: z.array(z.object({
    label: z.string().trim().min(1).max(100),
    choices: z.array(z.string().trim().min(1).max(100)).min(1)
  })).default([]),
  imageUrl: z.string().trim().min(1).max(2000),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0)
});

// GET /api/products - Get all active products
productsRouter.get('/products', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 });
    res.status(200).json({
      success: true,
      products: products.map((p) => ({
        id: p.slug || p._id.toString(),
        _id: p._id,
        name: p.name,
        slug: p.slug,
        cat: p.category,
        category: p.category,
        mat: p.material,
        material: p.material,
        price: p.price,
        desc: p.description,
        description: p.description,
        options: p.options,
        img: p.imageUrl,
        imageUrl: p.imageUrl,
        active: p.active,
        sortOrder: p.sortOrder
      }))
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products from catalog' });
  }
});

// GET /api/products/:slug - Get single product
productsRouter.get('/products/:slug', async (req: Request, res: Response) => {
  try {
    const product = await Product.findOne({
      $or: [{ slug: req.params.slug }, { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : null }]
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      product: {
        id: product.slug || product._id.toString(),
        _id: product._id,
        name: product.name,
        slug: product.slug,
        cat: product.category,
        mat: product.material,
        price: product.price,
        desc: product.description,
        options: product.options,
        img: product.imageUrl,
        active: product.active,
        sortOrder: product.sortOrder
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});
// POST /api/products - Create a product (admin only)
productsRouter.post('/products', requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = ProductInputSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const existing = await Product.findOne({ slug: parsed.data.slug });

    if (existing) {
      res.status(409).json({ error: 'A product with this slug already exists.' });
      return;
    }

    const product = await Product.create(parsed.data);

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// PUT /api/products/:slug - Update a product (admin only)
productsRouter.put('/products/:slug', requireAdmin, async (req: Request, res: Response) => {
  try {
    const parsed = ProductInputSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0].message });
      return;
    }

    const product = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      parsed.data,
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});
// PATCH /api/products/:slug/deactivate - Hide a product (admin only)
productsRouter.patch('/products/:slug/deactivate', requireAdmin, async (req: Request, res: Response) => {
  try {
    const product = await Product.findOneAndUpdate(
      { slug: req.params.slug },
      { active: false },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Deactivate product error:', error);
    res.status(500).json({ error: 'Failed to deactivate product.' });
  }
});