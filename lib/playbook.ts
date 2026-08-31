export const PLAYBOOK = [
  {
    id: "title",
    kicker: "01  ·  Paper",
    title: "Title, or you don't own it",
    body: "Minnesota DVS does not care that the yard swore it was fine. A sheriff bill of sale is not a title. A property-room receipt is not a title. A bonded title on a motorcycle is a six-month errand with a surety company.",
    rules: [
      "Clean title in the file — bid the model.",
      "Salvage on a Tahoe — part-out, don't rebuild unless the frame is proven.",
      "No title on a bike / sled / ATV — pass. Parts value rarely clears 28% after the trailer.",
      "VIN on the door sticker must match the plate and the paper. Walk if it doesn't.",
    ],
  },
  {
    id: "locks",
    kicker: "02  ·  Phones",
    title: "Locked phones are inventory theater",
    body: "iCloud lock and FRP are not a discount. They are a zero. Yards love photographing a table of glass because it photographs like money. It isn't.",
    rules: [
      "Activation lock on = pass. Do not 'try a service'.",
      "Blacklisted IMEI = pass even if it unlocks.",
      "Mixed lots: count the clean units only. Price the bricks at scrap.",
      "Ask the clerk, on the record, whether a release letter exists. If they shrug, leave.",
    ],
  },
  {
    id: "jewelry",
    kicker: "03  ·  Gold & glass",
    title: "Weigh it. Then decide if it's a story.",
    body: "Melt is the floor. Everything above melt is a story you have to be able to tell on camera. Fashion watches and unauthenticated Subs are how people donate money to PropertyRoom.",
    rules: [
      "Gold: dwt × spot × 0.585 (14k) × 0.92 window = melt floor.",
      "If the yard didn't weigh it, you don't have a number.",
      "Watches: no papers + fluorescent phone pic = homage until a bench says otherwise.",
      "Never bid a brand. Bid a weight, a movement, or a pass.",
    ],
  },
  {
    id: "season",
    kicker: "04  ·  Weather",
    title: "Minnesota is a calendar trade",
    body: "Snowblowers in August are a hold, not a flip. Plow trucks in May are a hold. Generators after a quiet summer are a hold. The desk does not need the cash this week if November will pay the rent.",
    rules: [
      "Buy seasonal in the opposite month.",
      "Don't list a Power Max in September and then complain about comps.",
      "Salt trucks: budget undercoat and a real inspection of the doghouse.",
      "If you can't store it, you can't hold it. That's a pass, not a cheaper bid.",
    ],
  },
  {
    id: "discipline",
    kicker: "05  ·  The room",
    title: "Bid the ceiling. Leave when it breaks.",
    body: "The model already stacked hammer, premium, tax, trailer, rehab, and the sell fee. If the lot does not still clear 28% net, it is a pass. Ego is not a line item.",
    rules: [
      "Ceiling is a hard stop. Not a suggestion.",
      "Two extra bids 'to win the room' is how the yard eats the year.",
      "Dead rooms are earned by walking away from live ones.",
      "Star it on the desk, set the max, close the laptop. Don't watch the last ninety seconds.",
    ],
  },
];

export function briefFor(title: string, category: string, flags: string[], kills: { why: string }[]) {
  const inspect = [
    "Photograph VIN / serial / door sticker against the lot ticket.",
    "Confirm title status with the clerk — ask to see the paper, not the listing.",
    "Start it. Listen cold. Look for dash lights that stay.",
    "Open every compartment. Yards hide the bad battery in the one you skip.",
    "Measure haul: gate hours, forklift, whether they load.",
  ];
  if (category === "vehicle") {
    inspect.push("Frame rails, doghouse rust, flood line, service stickers.");
    inspect.push("Scan if you can. A cheap Explorer with a dead BCM is not cheap.");
  }
  if (category === "phone") inspect.push("Settings → [name] for activation lock. IMEI check before you leave the cage.");
  if (category === "watch" || category === "jewelry") inspect.push("Loupe the hallmarks. Weigh it. Do not trust the tag.");
  if (category === "powersport" || category === "bike") inspect.push("Serial intact? Title in the file? If either is no, walk.");
  if (flags.includes("seasonal-hold")) inspect.push("Storage plan. If it sits in the driveway it will get stolen or rusted.");

  const kill = kills.length
    ? kills.map((k) => k.why)
    : [
        "Yield stacks under 28% after trailer and rehab.",
        "Title missing on anything that needs a plate.",
        "Lock screens, homage watches, license-only medical.",
      ];

  return {
    headline: `Brief · ${title}`,
    inspect,
    kill,
    closer:
      "If you cannot write the resale sentence in one line, you do not have a lot. You have a hobby.",
  };
}
