import { INVENTORY_CATEGORY } from '../../config/constants.js';

/**
 * A top-down pizza that assembles as the customer chooses: crust, sauce, cheese, then each
 * vegetable dropping into place. Colours are derived from option names so new menu items
 * look distinct without any per-item data in the client.
 */

const VIEWBOX = 200;
const CENTER = VIEWBOX / 2;
const RADIUS = { crust: 96, sauce: 82, cheese: 74, topping: 9 };
const TOPPING_RING = { inner: 28, outer: 58 };
const GOLDEN_ANGLE_DEG = 137.5;
const HUE_FULL_TURN = 360;
const PALETTE = {
  crustSaturation: 55,
  crustLightness: 62,
  sauceSaturation: 70,
  sauceLightness: 42,
  cheeseSaturation: 85,
  cheeseLightness: 72,
  toppingSaturation: 55,
  toppingLightness: 40,
  placeholder: '#e9e4d8',
};

const hueOf = (name) =>
  [...name].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % HUE_FULL_TURN, 7);
const hsl = (name, saturation, lightness) => `hsl(${hueOf(name)} ${saturation}% ${lightness}%)`;

/** Even-looking scatter: successive toppings sit a golden angle apart on alternating rings. */
function toppingPosition(index) {
  const angle = (index * GOLDEN_ANGLE_DEG * Math.PI) / 180;
  const ring = index % 2 === 0 ? TOPPING_RING.outer : TOPPING_RING.inner;
  return { x: CENTER + ring * Math.cos(angle), y: CENTER + ring * Math.sin(angle) };
}

export function PizzaPreview({ options }) {
  const by = (category) => options.filter((option) => option.category === category);
  const [base] = by(INVENTORY_CATEGORY.BASE);
  const [sauce] = by(INVENTORY_CATEGORY.SAUCE);
  const [cheese] = by(INVENTORY_CATEGORY.CHEESE);
  const veggies = by(INVENTORY_CATEGORY.VEGGIE);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      role="img"
      aria-label={`Your pizza: ${options.map((option) => option.name).join(', ') || 'nothing chosen yet'}`}
      className="mx-auto w-full max-w-xs drop-shadow-sm"
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS.crust}
        fill={
          base
            ? hsl(base.name, PALETTE.crustSaturation, PALETTE.crustLightness)
            : PALETTE.placeholder
        }
      />
      {sauce && (
        <circle
          key={sauce.id}
          className="topping-drop"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS.sauce}
          fill={hsl(sauce.name, PALETTE.sauceSaturation, PALETTE.sauceLightness)}
        />
      )}
      {cheese && (
        <circle
          key={cheese.id}
          className="topping-drop"
          cx={CENTER}
          cy={CENTER}
          r={RADIUS.cheese}
          fill={hsl(cheese.name, PALETTE.cheeseSaturation, PALETTE.cheeseLightness)}
        />
      )}
      {veggies.map((veggie, index) => {
        const { x, y } = toppingPosition(index);
        return (
          <circle
            key={veggie.id}
            className="topping-drop"
            cx={x}
            cy={y}
            r={RADIUS.topping}
            fill={hsl(veggie.name, PALETTE.toppingSaturation, PALETTE.toppingLightness)}
            stroke="white"
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}
