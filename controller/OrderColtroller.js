import OrderModel from "../models/OrderModels.js";

class OrderController {
  static orderDetails = async (req, res) => {
    try {
      const data = req.body.order_data;
      data.Order_date = req.body.order_date;
      const existingOrder = await OrderModel.findOne({ email: req.body.email });

      if (!existingOrder) {
        await OrderModel.create({
          email: req.body.email,
          order_data: [data],
        });
        res.json({ success: true });
      } else {
        await OrderModel.findOneAndUpdate(
          { email: req.body.email },
          { $push: { order_data: data } }
        );
        res.json({ success: true });
      }
    } catch (error) {
     
      res.status(500).send("Server Error");
    }
  };
// ---------------------------MyOrderDetails------------------------------------

  static myOrderDetails = async (req, res) => {
    try {
      const myOrderData = await OrderModel.findOne({ email: req.body.email });
      res.json({ orderData: myOrderData });
    } catch (error) {
  
      res.status(500).send("Server Error");
    }
  };
}

export default OrderController;
