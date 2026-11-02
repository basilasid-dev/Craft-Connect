/* ==========================================================================
   Mock data — realistic fixtures. Swap for an API later; the shape is stable.
   Exposes a single global: DATA
   ========================================================================== */
const DATA = (() => {
  const CURRENCY = '₹';

  /* ---------- Locations (used for "nearby" distance) ---------- */
  const locations = [
    { id: 'koramangala', name: 'Koramangala', city: 'Bengaluru', lat: 12.9352, lng: 77.6245 },
    { id: 'indiranagar', name: 'Indiranagar', city: 'Bengaluru', lat: 12.9784, lng: 77.6408 },
    { id: 'jayanagar', name: 'Jayanagar', city: 'Bengaluru', lat: 12.925, lng: 77.5938 },
    { id: 'malleshwaram', name: 'Malleshwaram', city: 'Bengaluru', lat: 13.0035, lng: 77.571 },
    { id: 'hsr', name: 'HSR Layout', city: 'Bengaluru', lat: 12.9116, lng: 77.6474 },
    { id: 'whitefield', name: 'Whitefield', city: 'Bengaluru', lat: 12.9698, lng: 77.75 },
  ];

  /* ---------- Product categories ---------- */
  const categories = [
    { name: 'Hampers', e: '🎁' },
    { name: 'Candles', e: '🕯️' },
    { name: 'Jewellery', e: '📿' },
    { name: 'Paintings', e: '🎨' },
    { name: 'Crochet', e: '🧶' },
    { name: 'Pottery', e: '🏺' },
    { name: 'Home decor', e: '🪴' },
    { name: 'Wedding', e: '💍' },
    { name: 'Craft kits', e: '✂️' },
  ];

  const materialCategories = [
    { name: 'Beads', e: '🔮' }, { name: 'Fabric', e: '🧵' }, { name: 'Yarn', e: '🧶' },
    { name: 'Clay', e: '🏺' }, { name: 'Paints', e: '🎨' }, { name: 'Paper', e: '📄' },
    { name: 'Ribbons', e: '🎀' }, { name: 'Tools', e: '✂️' }, { name: 'Packaging', e: '📦' },
    { name: 'Adhesives', e: '🧴' }, { name: 'Wax', e: '🕯️' },
  ];

  /* ---------- Crafters ---------- */
  // [id, username, name, location, bio, categories, emoji, hue, followers, following, verified]
  const crafters = [
    ['c1', 'crafty_gifts', 'Crafty Gifts', 'Indiranagar', 'Curated handmade hampers for every occasion. Birthdays, festivals, new babies — wrapped with love in Bengaluru.', ['Hampers', 'Wedding'], '🎁', 18, 12840, 212, true],
    ['c2', 'handmade_by_anu', 'Handmade by Anu', 'Koramangala', 'Crochet toys, totes and baby hampers. Every stitch made at my kitchen table, usually with chai.', ['Crochet', 'Hampers'], '🧶', 340, 8420, 301, true],
    ['c3', 'wick_and_wonder', 'Wick & Wonder', 'HSR Layout', 'Small-batch soy candles poured by hand. Calm scents, clean burn, reusable jars.', ['Candles', 'Craft kits'], '🕯️', 40, 21500, 164, true],
    ['c4', 'clay_stories', 'Clay Stories', 'Jayanagar', 'Wheel-thrown pottery with speckled glazes. Mugs, bowls and planters for slow mornings.', ['Pottery', 'Home decor'], '🏺', 25, 9610, 98, false],
    ['c5', 'bead_and_bloom', 'Bead & Bloom', 'Malleshwaram', 'Floral beaded jewellery in colours borrowed from sunsets and gardens.', ['Jewellery', 'Craft kits'], '📿', 290, 15230, 187, true],
    ['c6', 'canvas_by_meera', 'Canvas by Meera', 'Whitefield', 'Watercolour & acrylic paintings. Commissions open for pet portraits and home scenes.', ['Paintings'], '🎨', 200, 6980, 143, false],
    ['c7', 'knot_and_nest', 'Knot & Nest', 'Koramangala', 'Macramé wall art and plant hangers that make rooms feel lived-in.', ['Home decor'], '🪴', 120, 7340, 120, false],
    ['c8', 'paper_and_petal', 'Paper & Petal', 'Indiranagar', 'Wedding favours, quilled cards and DIY paper-craft kits for gifting and celebrating.', ['Wedding', 'Craft kits'], '💌', 350, 5120, 89, false],
  ].map(([id, u, name, loc, bio, cats, e, h, followers, following, verified]) =>
    ({ id, u, name, loc, bio, cats, e, h, followers, following, verified }));

  /* ---------- Products ---------- */
  // [id, crafter, name, price, category, emoji, hue, rating, reviews, stock, tags, description]
  const products = [
    ['p1', 'c1', 'Birthday Hamper', 1899, 'Hampers', '🎁', 18, 4.8, 126, 12, 'hamper gift birthday celebration', 'A cheerful box of handmade treats: scented candle, mini notebook, cookies, a hand-painted card and a keepsake trinket.'],
    ['p2', 'c1', 'Handmade Chocolate Hamper', 1499, 'Hampers', '🍫', 25, 4.9, 88, 8, 'hamper chocolate gift sweet', 'Small-batch dark and milk chocolates, truffles and a hand-lettered gift tag, packed in a reusable wooden crate.'],
    ['p3', 'c1', 'Self-care Hamper', 2299, 'Hampers', '🛁', 160, 4.7, 64, 5, 'hamper self care spa gift relax', 'Bath salts, soy candle, herbal tea, face mist and a hand-knit washcloth for a proper evening off.'],
    ['p4', 'c1', 'Festive Diya Hamper', 1299, 'Hampers', '🪔', 38, 4.6, 41, 0, 'hamper diwali festive diya gift', 'Painted diyas, sweets, fairy lights and a rangoli stencil — a Diwali table in a box.'],
    ['p5', 'c2', 'Amigurumi Bunny', 899, 'Crochet', '🐰', 340, 4.9, 203, 14, 'crochet toy amigurumi baby soft', 'A soft crocheted bunny in organic cotton. Safe stuffing, embroidered eyes, made to be hugged.'],
    ['p6', 'c2', 'Crochet Market Tote', 1199, 'Crochet', '👜', 20, 4.7, 77, 6, 'crochet bag tote cotton', 'A sturdy, stretchy tote in thick cotton cord. Fits a week of vegetables or a very large book.'],
    ['p7', 'c2', 'Baby Gift Hamper', 2499, 'Hampers', '🍼', 200, 4.8, 52, 4, 'hamper baby gift newborn crochet', 'Booties, a rattle, a swaddle and a tiny crocheted blanket in a keepsake basket.'],
    ['p8', 'c3', 'Lavender Soy Candle', 599, 'Candles', '🕯️', 270, 4.8, 312, 40, 'candle lavender soy scented', 'Hand-poured soy wax with a lavender and cedar scent. Cotton wick, about 40 hours of burn time.'],
    ['p9', 'c3', 'Amber Jar Candle Trio', 1399, 'Candles', '🔥', 35, 4.7, 98, 3, 'candle set trio amber gift', 'Three amber jar candles in vanilla, sandalwood and orange peel.'],
    ['p10', 'c3', 'Floating Diya Candles (set of 12)', 449, 'Candles', '🪷', 330, 4.6, 60, 25, 'candle diya floating diwali festive', 'Lotus-shaped floating candles that make any bowl of water look festive.'],
    ['p11', 'c4', 'Hand-thrown Ceramic Mug', 749, 'Pottery', '🍵', 22, 4.9, 180, 9, 'pottery mug ceramic clay handmade', 'A 300ml wheel-thrown mug with a speckled oat glaze. Dishwasher and microwave safe.'],
    ['p12', 'c4', 'Speckled Serving Bowl', 1650, 'Pottery', '🥣', 30, 4.8, 71, 4, 'pottery bowl ceramic serving', 'A generous serving bowl with a reactive glaze — no two are alike.'],
    ['p13', 'c4', 'Terracotta Planter Set', 1100, 'Home decor', '🪴', 15, 4.6, 55, 11, 'planter terracotta pottery plant decor', 'Three nesting terracotta planters with drainage holes and matching saucers.'],
    ['p14', 'c5', 'Beaded Daisy Necklace', 699, 'Jewellery', '📿', 290, 4.8, 140, 18, 'jewellery necklace beads daisy', 'Tiny glass seed beads woven into a daisy chain necklace. Adjustable clasp.'],
    ['p15', 'c5', 'Gemstone Drop Earrings', 549, 'Jewellery', '💎', 260, 4.7, 99, 22, 'jewellery earrings gemstone beads', 'Lightweight earrings with natural gemstone drops and hypoallergenic hooks.'],
    ['p16', 'c5', 'Bead Bracelet Kit', 799, 'Craft kits', '🧵', 310, 4.9, 67, 15, 'kit bracelet beads diy jewellery craft', 'Everything you need to make three stretch bracelets: beads, cord, charms and a how-to card.'],
    ['p17', 'c6', 'Monsoon Watercolour (A3)', 3200, 'Paintings', '🎨', 205, 4.9, 34, 1, 'painting watercolour art monsoon wall', 'Original watercolour on cotton paper. Signed and shipped flat with a mount.'],
    ['p18', 'c6', 'Custom Pet Portrait', 2800, 'Paintings', '🐶', 190, 5.0, 112, 99, 'painting portrait pet custom gift', 'Send a photo; get a hand-painted portrait of your pet in about two weeks.'],
    ['p19', 'c7', 'Macramé Wall Hanging', 1850, 'Home decor', '🧶', 120, 4.8, 90, 7, 'macrame wall hanging decor boho', 'A 60cm cotton macramé wall piece on a driftwood dowel.'],
    ['p20', 'c7', 'Boho Plant Hanger', 650, 'Home decor', '🌿', 135, 4.7, 120, 20, 'macrame plant hanger decor boho', 'Holds pots up to 8 inches. Ceiling hook included.'],
    ['p21', 'c8', 'Wedding Favour Box (set of 10)', 1750, 'Wedding', '💍', 350, 4.8, 58, 10, 'wedding favour box gift return', 'Ten hand-folded favour boxes with ribbon, petals and personalised tags.'],
    ['p22', 'c8', 'Quilling Card-Making Kit', 899, 'Craft kits', '✂️', 340, 4.7, 81, 13, 'kit quilling card paper craft diy', 'Quilling strips, a slotted tool, glue and a pattern book for six greeting cards.'],
    ['p23', 'c8', 'Personalised Wedding Invitation', 120, 'Wedding', '💌', 355, 4.9, 47, 200, 'wedding invitation card paper personalised', 'Per-card price. Letterpress-look design with a pressed-flower detail. Min. 25.'],
    ['p24', 'c3', 'Soy Wax Candle-Making Kit', 1299, 'Craft kits', '🧪', 45, 4.8, 73, 12, 'kit candle making soy wax diy craft', 'Wax, wicks, jars, fragrance oil and instructions to pour four candles at home.'],
  ].map(([id, c, name, price, cat, e, h, rating, reviews, stock, tags, desc]) =>
    ({ id, c, name, price, cat, e, h, rating, reviews, stock, tags, desc }));

  /* ---------- Posts (feed) ---------- */
  // [id, crafter, type(image|video|promo), title, caption, emoji, hue, likes, productId, badge, duration]
  const posts = [
    ['po1', 'c1', 'image', 'How I made this hamper', 'From a pile of ribbons to a finished birthday hamper — here is every step, including the gift-tag trick I wish I knew earlier.', '🎁', 18, 1284, 'p1', '', ''],
    ['po2', 'c1', 'video', '5 ideas for handmade hampers', 'Five hamper themes that work every single time: self-care, chocolate, baby, festive and the "just because" box.', '🧺', 30, 3410, 'p3', '', '0:48'],
    ['po3', 'c3', 'video', 'Pouring lavender candles', 'The pour that took me three years to get right. Wax at 65°C, wick centred, patience at maximum.', '🕯️', 270, 5230, 'p8', '', '0:32'],
    ['po4', 'c4', 'image', 'Fresh out of the kiln', 'The oat glaze came out beautifully speckled this batch. Mugs are going up tonight.', '🍵', 22, 902, 'p11', '', ''],
    ['po5', 'c2', 'video', 'Crochet bunny in 60 seconds', 'Magic ring to finished ears. Full written pattern is in my bio.', '🐰', 340, 7810, 'p5', '', '1:00'],
    ['po6', 'c5', 'promo', 'Festive sale: 20% off beaded jewellery', 'Our festive collection is live — daisy chains, gemstone drops and bracelet kits.', '📿', 290, 640, 'p14', 'Sponsored', ''],
    ['po7', 'c6', 'image', 'Monsoon series, finished', 'Eleven layers of wash and one very patient week. The last piece from the monsoon series.', '🌧️', 205, 1530, 'p17', '', ''],
    ['po8', 'c7', 'video', 'Macramé knots for beginners', 'Just three knots — square, spiral and gathering — and you can make almost anything.', '🪢', 120, 2970, 'p19', '', '2:14'],
    ['po9', 'c8', 'promo', 'Wedding season favour boxes — book early', 'December dates are filling up. Reserve your favour boxes and invitations now.', '💍', 350, 410, 'p21', 'Sponsored', ''],
    ['po10', 'c3', 'promo', 'Buy 2 candles, get a free matchbox', 'This week only: pick any two jar candles and we will tuck in a hand-lettered matchbox.', '🔥', 35, 788, 'p9', 'Featured', ''],
    ['po11', 'c5', 'image', 'Colour story: sunset beads', 'Peach, rose and a bit of marigold. This is the palette behind the new earring drop.', '🌅', 260, 1105, 'p15', '', ''],
    ['po12', 'c2', 'image', 'Baby hampers are back', 'Restocked the baby hamper with a softer, more breathable blanket. Limited quantities.', '🍼', 200, 1676, 'p7', '', ''],
    ['po13', 'c4', 'video', 'Throwing a bowl on the wheel', 'Centring is 90% of pottery and 100% of my stress. Watch the whole bowl come together.', '🥣', 30, 4098, 'p12', '', '0:57'],
    ['po14', 'c8', 'video', 'Quill a flower card in 3 steps', 'Roll, pinch, glue. A paper flower you can make while a series loads.', '🌸', 340, 1992, 'p22', '', '1:12'],
  ].map(([id, c, type, title, caption, e, h, likes, p, badge, duration]) =>
    ({ id, c, type, title, caption, e, h, likes, p, badge, duration }));

  /* ---------- Material shops ---------- */
  // [id, name, area, lat, lng, rating, reviews, opens, closes, emoji, hue, phone, about]
  const shops = [
    ['s1', 'Bead Bazaar', 'Chickpet', 12.9669, 77.575, 4.7, 412, 10, 20, '🔮', 285, '+91 98450 11201', 'Wholesale and retail beads, findings and jewellery wire since 1998.'],
    ['s2', 'Fabric & Thread House', 'Commercial Street', 12.9822, 77.6083, 4.5, 288, 10, 21, '🧵', 205, '+91 98450 11202', 'Cotton, felt, lace, ribbons and thread in every colour you can name.'],
    ['s3', 'Clay & Colour Studio', 'Jayanagar 4th Block', 12.925, 77.5938, 4.8, 193, 9, 19, '🎨', 22, '+91 98450 11203', 'Clay, glazes, paints and papers for potters and painters.'],
    ['s4', 'Paper Trail Supplies', 'Malleshwaram', 13.0035, 77.571, 4.6, 156, 10, 20, '📄', 45, '+91 98450 11204', 'Specialty paper, quilling supplies, adhesives and everyday craft tools.'],
    ['s5', 'Yarn Yard', 'Indiranagar 100ft Rd', 12.9784, 77.6408, 4.9, 341, 11, 20, '🧶', 340, '+91 98450 11205', 'A cosy yarn shop with a crochet corner on Saturdays.'],
    ['s6', 'Pack It Pretty', 'HSR Layout Sector 6', 12.9116, 77.6474, 4.4, 119, 10, 21, '📦', 120, '+91 98450 11206', 'Gift boxes, jars, twine, tissue and soy wax for makers who ship.'],
    ['s7', 'Hobby Hub', 'Whitefield Main Rd', 12.9698, 77.75, 4.3, 87, 10, 20, '🪄', 190, '+91 98450 11207', 'Resin, glitter and variety boxes for weekend crafters.'],
  ].map(([id, name, area, lat, lng, rating, reviews, opens, closes, e, h, phone, about]) =>
    ({ id, name, area, lat, lng, rating, reviews, opens, closes, e, h, phone, about }));

  /* ---------- Materials ---------- */
  // [shop, name, price, unit, stock, category, emoji, tags]
  const materialRows = [
    ['s1', 'Glass seed beads (assorted)', 80, 'pack', 120, 'Beads', '🔮', 'beads glass seed jewellery'],
    ['s1', 'Gemstone beads strand', 220, 'strand', 40, 'Beads', '💎', 'beads gemstone stone jewellery'],
    ['s1', 'Wooden beads 8mm', 60, 'pack', 0, 'Beads', '🟤', 'beads wooden'],
    ['s1', 'Jewellery wire', 90, 'roll', 55, 'Tools', '➰', 'wire jewellery beading'],
    ['s1', 'Earring hooks (pack of 50)', 40, 'pack', 200, 'Beads', '🪝', 'earring hooks findings jewellery'],
    ['s1', 'Beading needles', 35, 'pack', 80, 'Tools', '🪡', 'needles beading'],
    ['s2', 'Cotton fabric (per metre)', 160, 'metre', 80, 'Fabric', '🧵', 'fabric cotton cloth'],
    ['s2', 'Felt sheets', 15, 'sheet', 300, 'Fabric', '🟧', 'felt fabric sheets'],
    ['s2', 'Embroidery thread set', 220, 'set', 25, 'Fabric', '🧶', 'thread embroidery floss'],
    ['s2', 'Satin ribbon', 40, 'roll', 150, 'Ribbons', '🎀', 'ribbon satin gift wrap'],
    ['s2', 'Lace trim', 70, 'metre', 60, 'Ribbons', '🪢', 'lace trim ribbon'],
    ['s2', 'Fabric scissors', 350, 'piece', 12, 'Tools', '✂️', 'scissors fabric tools shears'],
    ['s3', 'Air-dry clay 1kg', 320, 'pack', 35, 'Clay', '🏺', 'clay air dry'],
    ['s3', 'Terracotta clay 5kg', 450, 'bag', 18, 'Clay', '🏺', 'clay terracotta pottery'],
    ['s3', 'Acrylic paint set (12 colours)', 540, 'set', 22, 'Paints', '🎨', 'paint acrylic colours'],
    ['s3', 'Watercolour paper A3', 25, 'sheet', 150, 'Paper', '📄', 'paper watercolour art'],
    ['s3', 'Brush set', 280, 'set', 4, 'Paints', '🖌️', 'brush paint tools'],
    ['s3', 'Pottery glaze 250ml', 380, 'bottle', 8, 'Clay', '🫙', 'glaze pottery clay'],
    ['s4', 'Quilling strips', 120, 'pack', 70, 'Paper', '📜', 'quilling paper strips'],
    ['s4', 'Handmade paper', 30, 'sheet', 90, 'Paper', '📄', 'paper handmade'],
    ['s4', 'Kraft paper roll', 140, 'roll', 20, 'Packaging', '📦', 'kraft paper packaging wrap'],
    ['s4', 'Glue gun sticks', 90, 'pack', 60, 'Adhesives', '🔫', 'glue gun sticks adhesive'],
    ['s4', 'Fabric glue', 110, 'tube', 3, 'Adhesives', '🧴', 'glue fabric adhesive'],
    ['s4', 'Craft scissors', 120, 'piece', 45, 'Tools', '✂️', 'scissors craft tools'],
    ['s5', 'Cotton yarn 100g', 150, 'skein', 200, 'Yarn', '🧶', 'yarn cotton crochet knit'],
    ['s5', 'Merino wool 50g', 320, 'skein', 30, 'Yarn', '🧶', 'yarn wool merino knit'],
    ['s5', 'Crochet hook set', 399, 'set', 25, 'Tools', '🪝', 'crochet hook tools'],
    ['s5', 'Macramé cord 3mm (100m)', 380, 'spool', 14, 'Yarn', '🪢', 'macrame cord rope'],
    ['s5', 'Stuffing fibre 250g', 140, 'bag', 40, 'Yarn', '☁️', 'stuffing fibre toy'],
    ['s6', 'Gift boxes (pack of 10)', 250, 'pack', 60, 'Packaging', '📦', 'box gift packaging hamper'],
    ['s6', 'Tissue paper', 90, 'pack', 100, 'Packaging', '🎐', 'tissue paper packaging'],
    ['s6', 'Jute twine', 60, 'roll', 110, 'Packaging', '🪢', 'twine jute string packaging'],
    ['s6', 'Candle jars (12 pcs)', 420, 'pack', 25, 'Packaging', '🫙', 'jar candle glass'],
    ['s6', 'Soy wax 1kg', 380, 'bag', 33, 'Wax', '🕯️', 'wax soy candle'],
    ['s6', 'Ribbon assortment', 180, 'pack', 70, 'Ribbons', '🎀', 'ribbon assortment gift'],
    ['s7', 'Resin starter kit', 899, 'kit', 9, 'Adhesives', '🧪', 'resin epoxy kit'],
    ['s7', 'Beads variety box', 450, 'box', 15, 'Beads', '🔮', 'beads variety box'],
    ['s7', 'Glitter pack', 60, 'pack', 100, 'Paper', '✨', 'glitter sparkle decoration'],
    ['s7', 'Craft scissors set', 199, 'set', 30, 'Tools', '✂️', 'scissors craft tools'],
  ];
  const materials = materialRows.map(([s, name, price, unit, stock, cat, e, tags], i) =>
    ({ id: 'm' + (i + 1), s, name, price, unit, stock, cat, e, tags }));

  /* ---------- Crafter profile extras (merged onto each crafter) ---------- */
  const CRAFTER_EXTRA = {
    c1: { tagline: 'Handmade gifts and personalised hampers.', specialities: ['Personalised hampers', 'Corporate gifting', 'Festive boxes', 'Eco-friendly wrapping'],
      custom: { yes: true, note: 'Personalised hampers take 3 days; bulk orders need 7.' }, response: 'Within 2 hours', since: 2021,
      story: 'Started as birthday boxes for friends and grew into a small studio that packs every hamper by hand.',
      offer: { title: 'Free gift card above ₹2,000', text: 'A hand-lettered card with any hamper over ₹2,000', ends: 'Until 31 Oct', p: 'p3' } },
    c2: { tagline: 'Crochet toys, totes and baby hampers, stitched at home.', specialities: ['Amigurumi', 'Baby gifting', 'Cotton totes', 'Custom colours'],
      custom: { yes: true, note: 'Pick your colours. Lead time 7–10 days.' }, response: 'Within a day', since: 2020,
      story: 'Anu learned to crochet from her grandmother and now makes soft toys that are safe for newborns.',
      offer: { title: '10% off baby hampers', text: 'Applied automatically on your first order', ends: 'This week', p: 'p7' } },
    c3: { tagline: 'Small-batch soy candles with calm scents.', specialities: ['Soy wax', 'Custom scents', 'Candle-making kits', 'Wedding favours'],
      custom: { yes: true, note: 'Custom scents and labels for orders of 12 or more.' }, response: 'Within 3 hours', since: 2019,
      story: 'Every candle is poured in the HSR studio with natural wax, cotton wicks and reusable jars.',
      offer: { title: 'Buy 2 candles, get a free matchbox', text: 'On any two jar candles', ends: 'This week', p: 'p9' } },
    c4: { tagline: 'Wheel-thrown pottery for slow mornings.', specialities: ['Stoneware', 'Speckled glazes', 'Dinner sets', 'Planters'],
      custom: { yes: true, note: 'Dinner sets made to order in about 3 weeks.' }, response: 'Within a day', since: 2018,
      story: 'A one-person studio near Jayanagar, firing small batches twice a month.',
      offer: { title: 'Free shipping on sets', text: 'Orders of three or more pieces', ends: 'Until 15 Nov', p: 'p12' } },
    c5: { tagline: 'Floral beadwork inspired by gardens and sunsets.', specialities: ['Seed-bead weaving', 'Gemstone jewellery', 'DIY kits', 'Bridal sets'],
      custom: { yes: true, note: 'Bridal sets and colour matching, about 2 weeks.' }, response: 'Within 4 hours', since: 2020,
      story: 'Bead & Bloom began with a bracelet gifted to a friend and now ships all over the country.',
      offer: { title: '20% off festive jewellery', text: 'The whole festive collection', ends: 'Until 31 Oct', p: 'p14' } },
    c6: { tagline: 'Watercolour and acrylic art. Commissions open.', specialities: ['Watercolour', 'Acrylic', 'Pet portraits', 'Home scenes'],
      custom: { yes: true, note: 'Commissions take about 2 weeks. A sketch is shared first.' }, response: 'Within a day', since: 2022,
      story: 'Meera paints mostly from rainy-day memories and takes a handful of commissions each month.',
      offer: { title: 'Commissions open this month', text: 'Book a pet portrait and get a free mount', ends: 'Until 30 Nov', p: 'p18' } },
    c7: { tagline: 'Macramé that makes rooms feel lived-in.', specialities: ['Macramé', 'Plant hangers', 'Wall art', 'Workshops'],
      custom: { yes: true, note: 'Custom sizes and colours, about 10 days.' }, response: 'Within 6 hours', since: 2021,
      story: 'Knot & Nest teaches weekend macramé workshops and sells the pieces made in them.',
      offer: { title: 'Plant hanger bundle', text: 'Buy three hangers and save ₹300', ends: 'This month', p: 'p20' } },
    c8: { tagline: 'Paper-craft for weddings and gifting.', specialities: ['Wedding favours', 'Invitations', 'Quilling', 'Craft kits'],
      custom: { yes: true, note: 'Minimum 25 invitations. Proof within 24 hours.' }, response: 'Within 2 hours', since: 2022,
      story: 'Paper & Petal designs each suite by hand, with pressed flowers from a friend’s garden.',
      offer: { title: 'Book December dates early', text: '10% off favour boxes when you reserve now', ends: 'Until 30 Nov', p: 'p21' } },
  };
  crafters.forEach(c => Object.assign(c, CRAFTER_EXTRA[c.id]));

  /* ---------- Lookup maps ---------- */
  const byId = { crafter: {}, product: {}, post: {}, shop: {}, material: {} };
  crafters.forEach(x => byId.crafter[x.id] = x);
  products.forEach(x => byId.product[x.id] = x);
  posts.forEach(x => byId.post[x.id] = x);
  shops.forEach(x => byId.shop[x.id] = x);
  materials.forEach(x => byId.material[x.id] = x);
  const crafterByUsername = u => crafters.find(c => c.u === u);

  /* ---------- Helpers ---------- */
  function distanceKm(a, b) {
    const R = 6371, rad = d => d * Math.PI / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  /* ---------- Product detail content (derived per category, with overrides) ---------- */
  const INCLUDED = {
    p1: ['Scented soy candle', 'Mini notebook', 'Assorted cookies (6)', 'Hand-painted card', 'Keepsake trinket'],
    p2: ['Dark & milk chocolates (12)', 'Truffles (4)', 'Hand-lettered gift tag', 'Reusable wooden crate'],
    p3: ['Bath salts', 'Soy candle', 'Herbal tea (5 bags)', 'Face mist', 'Hand-knit washcloth'],
    p4: ['Painted diyas (6)', 'Festive sweets', 'Fairy lights', 'Rangoli stencil'],
    p7: ['Crochet booties', 'Rattle', 'Cotton swaddle', 'Mini crochet blanket', 'Keepsake basket'],
  };
  const CAT_INFO = {
    Hampers: { materials: ['Reusable wooden crate', 'Natural soy wax', 'Cotton', 'Recycled paper'], days: [2, 4], custom: 'Add a gift message and a colour theme, and tell us what to leave out (for example allergies). We will confirm details before packing.' },
    Candles: { materials: ['100% soy wax', 'Cotton wick', 'Skin-safe fragrance oil', 'Reusable glass jar'], days: [2, 3] },
    Jewellery: { materials: ['Glass seed beads', 'Nylon-coated thread', 'Hypoallergenic findings'], days: [2, 4] },
    Paintings: { materials: ['Cotton rag paper', 'Artist-grade paint', 'Archival mount'], days: [4, 7] },
    Crochet: { materials: ['Organic cotton yarn', 'Safe polyfill stuffing', 'Embroidered details'], days: [3, 5] },
    Pottery: { materials: ['Stoneware clay', 'Food-safe glaze'], days: [3, 5] },
    'Home decor': { materials: ['Natural cotton cord', 'Driftwood or terracotta', 'Metal hardware'], days: [3, 5] },
    Wedding: { materials: ['Handmade paper', 'Satin ribbon', 'Pressed flowers'], days: [5, 8], custom: 'Names, date and colours can be personalised. Share the details in the note and we will send a proof within 24 hours.' },
    'Craft kits': { materials: ['Pre-measured materials', 'Basic tools', 'Illustrated instructions'], days: [2, 4] },
  };
  const REVIEWS = [
    ['Meera K.', 5, 'Beautifully made and arrived well packed. The quality is better than the photos.'],
    ['Rohan S.', 5, 'Bought it as a gift and the recipient loved it. Quick replies from the crafter too.'],
    ['Divya R.', 4, 'Lovely piece. Delivery took a day longer than expected but worth the wait.'],
    ['Aarav P.', 5, 'You can tell it is made by hand. Will order again.'],
    ['Sana M.', 4, 'Gorgeous colours and finishing. Slightly smaller than I imagined, but perfect.'],
    ['Nikhil T.', 5, 'Great value for something this thoughtful. Packaging was lovely.'],
  ];
  /** Rich detail content for the product page. */
  function details(p) {
    const info = CAT_INFO[p.cat] || CAT_INFO['Craft kits'];
    const custom = p.id === 'p18' ? 'Send us a clear photo after ordering. We will share a sketch for approval before painting.'
      : p.id === 'p23' ? CAT_INFO.Wedding.custom : info.custom;
    const n = +p.id.slice(1);
    const days = p.id === 'p18' ? [10, 14] : info.days;
    return {
      included: INCLUDED[p.id] || [`1 × ${p.name}`, 'Care instructions card', 'Plastic-free, recycled packaging'],
      materials: info.materials,
      customisable: !!custom,
      customText: custom || 'This piece is made as shown. Small variations in colour and texture are part of its handmade character.',
      days,
      returns: custom
        ? 'Personalised and made-to-order items cannot be returned, but if something arrives damaged or not as agreed we will remake or refund it. Contact us within 48 hours of delivery.'
        : 'Easy 7-day returns on unused items in original packaging. If it arrives damaged, we will replace it or refund you.',
      reviews: [0, 1, 2].map(i => {
        const [name, rating, text] = REVIEWS[(n + i * 2) % REVIEWS.length];
        return { name, rating, text, when: ['2 weeks ago', '1 month ago', '2 months ago'][i] };
      }),
    };
  }

  const trending = ['hamper', 'candles', 'crochet', 'earrings', 'wedding favours', 'pottery', 'macramé'];
  const marketTrending = ['beads', 'yarn', 'ribbons', 'clay', 'scissors', 'soy wax', 'packaging'];

  return {
    CURRENCY, locations, categories, materialCategories, crafters, products, posts, shops, materials,
    byId, crafterByUsername, distanceKm, details, trending, marketTrending,
  };
})();
