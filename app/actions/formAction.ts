'use server'

import { FormSchemaType } from '@/components/component/form'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function createInvoice(formData: FormSchemaType) {
  console.log('Creating invoice:', formData);
  try {
    const Invoice = await prisma.invoice.create({
      data: formData
    })
    console.log('Created invoice:', Invoice);
    
    return { success: true, Invoice }
  } catch (error) {
    console.error('Failed to create user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}