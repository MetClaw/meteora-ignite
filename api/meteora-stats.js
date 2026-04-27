// Public Meteora stats endpoint.
// Pulls live TVL, volume, and fees from DefiLlama public API.
// Cached at the edge for 5 minutes to be a good citizen.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [protocolRes, volRes, feeRes] = await Promise.all([
      fetch('https://api.llama.fi/protocol/meteora', { next: { revalidate: 300 } }),
      fetch('https://api.llama.fi/summary/dexs/meteora?dataType=dailyVolume', { next: { revalidate: 300 } }),
      fetch('https://api.llama.fi/summary/fees/meteora?dataType=dailyFees', { next: { revalidate: 300 } }),
    ]);

    const protocol = await protocolRes.json();
    const vol = await volRes.json();
    const fee = await feeRes.json();

    const tvl = protocol?.currentChainTvls?.Solana ?? null;
    const tvlSeries = Array.isArray(protocol?.tvl) ? protocol.tvl : [];
    const lastUpdate = tvlSeries.length ? tvlSeries[tvlSeries.length - 1].date : null;

    return res.status(200).json({
      tvl,
      volume24h: vol?.total24h ?? null,
      volume7d: vol?.total7d ?? null,
      volume30d: vol?.total30d ?? null,
      volumeChange1d: vol?.change_1d ?? null,
      fees24h: fee?.total24h ?? null,
      fees7d: fee?.total7d ?? null,
      fees30d: fee?.total30d ?? null,
      lastUpdate,
      fetchedAt: Math.floor(Date.now() / 1000),
      source: 'defillama',
    });
  } catch (err) {
    console.error('meteora-stats error:', err);
    return res.status(200).json({
      tvl: null, volume24h: null, fees24h: null,
      error: 'fetch_failed',
      fetchedAt: Math.floor(Date.now() / 1000),
    });
  }
}
