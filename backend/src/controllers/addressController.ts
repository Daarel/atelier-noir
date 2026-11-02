import type { NextFunction, Request, Response } from 'express';

import { createAddressSchema, updateAddressSchema } from '@/schemas/addressSchema.js';
import AddressService from '@/services/addressService.js';

class AddressController {
  /**
   * @desc Mengambil semua data alamat
   * @route /api/v1/addresses/
   * @acc Private
   */
  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const addresses = await AddressService.findAllAddresses(userId);

      return res.status(200).json({
        success: true,
        data: addresses,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menambahkan alamat
   * @route /api/v1/addresses/
   * @acc Private
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const data = createAddressSchema.parse(req.body);

      const newAddress = await AddressService.createAddress(userId, data);

      return res.status(201).json({
        success: true,
        message: 'Alamat berhasil ditambahkan',
        data: newAddress,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengambil detail alamat berdasarkan id
   * @route /api/v1/addresses/:id
   * @acc Private
   */
  static async findDetail(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const address = await AddressService.findAddressById(id, userId);

      return res.status(200).json({
        success: true,
        data: address,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Mengubah data alamat berdasarkan id
   * @route /api/v1/addresses/:id
   * @acc Private
   */
  static async update(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const data = updateAddressSchema.parse(req.body);

      const updatedAddress = await AddressService.updateAddressById(userId, id, data);

      return res.status(200).json({
        success: true,
        message: 'Alamat berhasil diubah',
        data: updatedAddress,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @desc Menghapus alamat berdasarkan id
   * @route /api/v1/addresses/:id
   * @acc Private
   */
  static async remove(req: Request<{ id: string }>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await AddressService.removeAddressById(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Alamat berhasil dihapus',
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AddressController;
