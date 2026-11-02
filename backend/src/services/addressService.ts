import { NotFoundError } from '@/errors/error.js';
import { prisma } from '@/lib/prisma.js';
import type { CreateAddressInput, UpdateAddressInput } from '@/schemas/addressSchema.js';

class AddressService {
  static async findAllAddresses(customerId: string) {
    const addresses = await prisma.address.findMany({
      where: {
        userId: customerId,
      },
      orderBy: {
        isDefault: 'desc',
      },
    });

    return addresses;
  }

  static async findAddressById(addressId: string, userId: string) {
    const address = await prisma.address.findUnique({
      where: { id: addressId, userId },
    });

    if (!address) throw new NotFoundError('Alamat tidak ditemukan');

    return address;
  }

  static async createAddress(userId: string, data: CreateAddressInput) {
    const totalAddress = await prisma.address.count({
      where: {
        userId,
      },
    });

    const shouldBeDefault = totalAddress === 0 || !!data.isDefault;

    const newAddress = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return await tx.address.create({
        data: {
          ...data,
          userId,
          isDefault: shouldBeDefault,
        },
      });
    });

    return newAddress;
  }

  static async updateAddressById(userId: string, addressId: string, data: UpdateAddressInput) {
    const shouldBeDefault = data.isDefault;

    const updatedAddress = await prisma.$transaction(async (tx) => {
      const existingAddress = await tx.address.findUnique({
        where: { id: addressId, userId },
      });

      if (!existingAddress) throw new NotFoundError('Alamat tidak ditemukan');

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return await tx.address.update({
        where: { id: addressId },
        data: {
          ...data,
          userId,
          isDefault: shouldBeDefault,
        },
      });
    });

    return updatedAddress;
  }

  static async removeAddressById(addressId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const existingAddress = await tx.address.findUnique({
        where: { id: addressId, userId },
      });

      if (!existingAddress) throw new NotFoundError('Alamat tidak ditemukan');

      const removedAddress = await tx.address.delete({
        where: { id: addressId },
      });

      if (existingAddress.isDefault) {
        const remainingAddress = await tx.address.findFirst({
          where: { userId },
          orderBy: { id: 'asc' },
        });

        if (remainingAddress) {
          await tx.address.update({
            where: { id: remainingAddress.id },
            data: { isDefault: true },
          });
        }
      }

      return removedAddress;
    });
  }
}

export default AddressService;
