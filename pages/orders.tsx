import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";

interface LineItem {
  price_data: {
    product_data: {
      name: string;
    };
  };
  quantity: number;
}

interface Order {
  _id: string;
  createdAt: string;
  paid: boolean;
  name: string;
  email: string;
  city: string;
  postalCode: string;
  country: string;
  streetAddress: string;
  line_items: LineItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]); // Order tipi kullanıldı

  useEffect(() => {
    axios.get("/api/orders").then((response) => {
      setOrders(response.data);
    });
  }, []);

  return (
    <Layout>
      <h1>Orders</h1>
      <table className="basic">
        <thead>
          <tr>
            <th>Date</th>
            <th>Paid</th>
            <th>Recipient</th>
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 &&
            orders.map((order) => (
              <tr key={order._id}>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td className={order.paid ? "text-green-600" : "text-red-600"}>
                  {order.paid ? "YES" : "NO"}
                </td>
                <td>
                  {order.name} {order.email}
                  <br />
                  {order.city} {order.postalCode} {order.country}
                  <br />
                  {order.streetAddress}
                </td>
                <td>
                  {order.line_items.map((l, index) => (
                    <span key={index}>
                      {l.price_data?.product_data.name} x{l.quantity}
                      <br />
                    </span>
                  ))}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </Layout>
  );
}
