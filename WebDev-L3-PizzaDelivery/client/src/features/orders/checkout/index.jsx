import { Modal } from '../../../components/ui/Modal.jsx';
import { PAYMENT_PROVIDER } from '../../../config/constants.js';
import { MockCheckout } from './MockCheckout.jsx';
import { RazorpayCheckout } from './RazorpayCheckout.jsx';

// Which checkout UI handles which provider. Adding a gateway is one entry.
const ADAPTERS = Object.freeze({
  [PAYMENT_PROVIDER.MOCK]: MockCheckout,
  [PAYMENT_PROVIDER.RAZORPAY]: RazorpayCheckout,
});

/**
 * Takes payment for an order that has just been placed. The provider named in `checkout`
 * (decided by server config) picks the UI; the surrounding contract is identical:
 * `onPaid(order)` on success, `onFailed()` when payment fails or is abandoned.
 * The dialog cannot be dismissed by accident: each adapter offers an explicit way out.
 */
export function CheckoutDialog({ order, checkout, onPaid, onFailed }) {
  const Adapter = ADAPTERS[checkout.provider];

  return (
    <Modal open title="Complete your payment" dismissible={false}>
      {Adapter ? (
        <Adapter order={order} checkout={checkout} onPaid={onPaid} onFailed={onFailed} />
      ) : (
        <p role="alert">This payment method is not supported by this version of the app.</p>
      )}
    </Modal>
  );
}
