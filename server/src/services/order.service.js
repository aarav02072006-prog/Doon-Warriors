import { supabase } from '../config/supabase.js'
import { ApiError } from '../utils/ApiError.js'

export const orderService = {
  async createOrder(userId, { is_buy_now, buy_now_item, payment_method, address }) {
    let rawItems = []

    if (is_buy_now && buy_now_item) {
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .select('id, title, price, stock_available')
        .eq('id', buy_now_item.product_id)
        .single()

      if (prodErr || !prod) {
        throw new ApiError(404, 'Product not found', 'NOT_FOUND')
      }
      if (prod.stock_available < buy_now_item.qty) {
        throw new ApiError(400, `Insufficient stock for ${prod.title}`, 'OUT_OF_STOCK')
      }

      rawItems = [{
        product_id: prod.id,
        title: prod.title,
        price: prod.price,
        qty: buy_now_item.qty,
        size: buy_now_item.size || '',
      }]
    } else {
      const { data: cartItems, error: cartErr } = await supabase
        .from('cart_items')
        .select('product_id, qty, size, products(id, title, price, stock_available)')
        .eq('user_id', userId)

      if (cartErr || !cartItems || cartItems.length === 0) {
        throw new ApiError(400, 'Cart is empty', 'CART_EMPTY')
      }

      for (const ci of cartItems) {
        const prod = ci.products
        if (!prod || prod.stock_available < ci.qty) {
          throw new ApiError(400, `Product ${prod?.title || ci.product_id} is out of stock`, 'OUT_OF_STOCK')
        }
        rawItems.push({
          product_id: prod.id,
          title: prod.title,
          price: prod.price,
          qty: ci.qty,
          size: ci.size || '',
        })
      }
    }

    const subtotal = rawItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    const deliveryFee = subtotal >= 299 || subtotal === 0 ? 0 : 49
    const total = subtotal + deliveryFee

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        status: 'placed',
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method,
        address,
      })
      .select('id, user_id, status, subtotal, delivery_fee, total, payment_method, address, created_at')
      .single()

    if (orderErr || !order) {
      throw new ApiError(500, orderErr?.message || 'Failed to create order', 'DB_ERROR')
    }

    const orderItemsToInsert = rawItems.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      title: item.title,
      price: item.price,
      qty: item.qty,
      size: item.size,
    }))

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsToInsert)
    if (itemsErr) {
      throw new ApiError(500, itemsErr.message, 'DB_ERROR')
    }

    for (const item of rawItems) {
      const { data: prodData } = await supabase.from('products').select('stock_available').eq('id', item.product_id).single()
      if (prodData) {
        await supabase.from('products').update({ stock_available: Math.max(0, prodData.stock_available - item.qty) }).eq('id', item.product_id)
      }
    }

    if (!is_buy_now) {
      await supabase.from('cart_items').delete().eq('user_id', userId)
    }

    return {
      ...order,
      items: rawItems,
    }
  },

  async getOrders(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, status, subtotal, delivery_fee, total, payment_method, address, created_at, order_items(id, product_id, title, price, qty, size)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new ApiError(500, error.message, 'DB_ERROR')
    }
    return data || []
  },

  async getOrderById(userId, orderId) {
    const { data, error } = await supabase
      .from('orders')
      .select('id, user_id, status, subtotal, delivery_fee, total, payment_method, address, created_at, order_items(id, product_id, title, price, qty, size)')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      throw new ApiError(404, 'Order not found', 'NOT_FOUND')
    }
    return data
  },
}
