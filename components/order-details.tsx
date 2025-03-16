import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

interface OrderDetailsProps {
  orderId: string
  email: string
  date: string
  amount: string
}

export function OrderDetails({ orderId, email, date, amount }: OrderDetailsProps) {
  return (
    <Card className="mb-8 shadow-lg border-2 border-green-100">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Order Confirmed
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Order ID</p>
            <p className="font-medium">{orderId || "Not available"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="font-medium">{date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-medium">${amount}</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm">
            A receipt has been sent to your email. Please check your inbox (and spam folder) for confirmation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

