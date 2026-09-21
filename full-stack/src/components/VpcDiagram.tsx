const YELLOW = "#FFD200";
const BLUE = "#5EA1FF";
const GREY = "#5A5A66";
const FG = "#E8E8ED";
const PANEL = "#101015";

function Box({
  x, y, w, h, fill = PANEL, stroke = GREY, dash, strokeWidth = 1.25,
}: { x: number; y: number; w: number; h: number; fill?: string; stroke?: string; dash?: string; strokeWidth?: number }) {
  return (
    <rect
      x={x} y={y} width={w} height={h}
      fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      strokeDasharray={dash}
    />
  );
}

function Label({
  x, y, children, size = 11, color = FG, weight = 600, anchor = "start", mono = true,
}: { x: number; y: number; children: React.ReactNode; size?: number; color?: string; weight?: number; anchor?: "start" | "middle" | "end"; mono?: boolean }) {
  return (
    <text
      x={x} y={y}
      fontFamily={mono ? "'IBM Plex Mono', monospace" : "'IBM Plex Sans', sans-serif"}
      fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor}
    >
      {children}
    </text>
  );
}

export default function VpcDiagram() {
  return (
    <svg
      viewBox="0 0 1040 620"
      className="h-auto w-full"
      role="img"
      aria-label="VPC architecture: client and GitHub Actions reach an EC2 instance in a public subnet via an internet gateway; the EC2 instance proxies to RDS in a private subnet via a NAT gateway, and ships logs to CloudWatch."
    >
      <defs>
        <marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={BLUE} />
        </marker>
        <marker id="arrowY" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill={YELLOW} />
        </marker>
      </defs>

      {/* ── outside-VPC actors ── */}
      <Box x={16} y={210} w={168} h={64} stroke={BLUE} />
      <Label x={32} y={236} color={BLUE}>CLIENT BROWSER</Label>
      <Label x={32} y={254} size={9.5} color={GREY} weight={400}>ashuk.ddns.net · HTTPS</Label>

      <Box x={16} y={340} w={168} h={64} stroke={GREY} />
      <Label x={32} y={366}>GITHUB ACTIONS</Label>
      <Label x={32} y={384} size={9.5} color={GREY} weight={400}>push to master → deploy</Label>

      {/* ── VPC boundary ── */}
      <Box x={244} y={36} w={760} h={548} fill="none" stroke={YELLOW} dash="5 4" strokeWidth={1.5} />
      <Label x={260} y={62} size={12} color={YELLOW} weight={700}>VPC · grid6.0-VPCv2.0 · 10.0.0.0/16</Label>

      {/* internet gateway */}
      <Box x={264} y={218} w={84} h={44} stroke={YELLOW} />
      <Label x={306} y={236} size={9.5} anchor="middle">IGW</Label>
      <Label x={306} y={250} size={8} color={GREY} weight={400} anchor="middle">public route</Label>

      {/* ── public subnet ── */}
      <Box x={388} y={90} w={320} h={310} fill="#0D1420" stroke={BLUE} strokeWidth={1.25} />
      <Label x={402} y={112} size={10.5} color={BLUE}>PUBLIC SUBNET · us-east-1a</Label>
      <Label x={402} y={126} size={8.5} color={GREY} weight={400}>grid-public-subnet-v2.0</Label>

      <Box x={410} y={146} w={276} h={160} fill="#141420" stroke={FG} />
      <Label x={426} y={170} size={11.5} weight={700}>EC2 · t2.micro</Label>
      <Label x={426} y={190} size={9.5} color={GREY} weight={400}>nginx :80 → 301 → :443 (TLS)</Label>
      <Label x={426} y={206} size={9.5} color={GREY} weight={400}>Let&apos;s Encrypt via Certbot</Label>
      <Label x={426} y={222} size={9.5} color={GREY} weight={400}>proxy_pass → NestJS :3000</Label>
      <Label x={426} y={238} size={9.5} color={GREY} weight={400}>per-route limit_req zones</Label>
      <Label x={426} y={260} size={8.5} color={YELLOW} weight={600}>SG + NACL: 22 · 80 · 443 · 9000 · 5432</Label>
      <Label x={426} y={274} size={8.5} color={GREY} weight={400}>all other inbound denied</Label>

      <Label x={402} y={420} size={9} color={GREY} weight={400}>8 subnets total across the VPC (public + private)</Label>

      {/* nat gateway */}
      <Box x={734} y={218} w={84} h={44} stroke={YELLOW} />
      <Label x={776} y={236} size={9.5} anchor="middle">NAT GW</Label>
      <Label x={776} y={250} size={8} color={GREY} weight={400} anchor="middle">gridv2.0-pvt-NAT</Label>

      {/* ── private subnet ── */}
      <Box x={858} y={90} w={126} h={310} fill="#140D0D" stroke={GREY} strokeWidth={1.25} />
      <Label x={870} y={112} size={9.5} color={FG}>PRIVATE</Label>
      <Label x={870} y={124} size={9.5} color={FG}>SUBNET</Label>
      <Label x={870} y={140} size={8} color={GREY} weight={400}>RDS-Pvt-subnet</Label>

      <Box x={868} y={160} w={106} h={130} fill="#141420" stroke={FG} />
      <Label x={921} y={182} size={10} weight={700} anchor="middle">RDS</Label>
      <Label x={921} y={196} size={9} weight={700} anchor="middle">PostgreSQL</Label>
      <Label x={921} y={216} size={8} color={GREY} weight={400} anchor="middle">no public IP</Label>
      <Label x={921} y={228} size={8} color={GREY} weight={400} anchor="middle">private subnet only</Label>

      {/* cloudwatch, outside VPC to the right-bottom */}
      <Box x={734} y={470} w={250} h={64} stroke={GREY} />
      <Label x={750} y={496}>AMAZON CLOUDWATCH</Label>
      <Label x={750} y={514} size={9.5} color={GREY} weight={400}>app + access logs</Label>

      {/* ── request path (solid blue) ── */}
      <path d="M184,242 L264,240" stroke={BLUE} strokeWidth={1.5} fill="none" markerEnd="url(#arrow)" />
      <path d="M348,240 L410,226" stroke={BLUE} strokeWidth={1.5} fill="none" markerEnd="url(#arrow)" />
      <path d="M686,226 L734,240" stroke={BLUE} strokeWidth={1.5} fill="none" markerEnd="url(#arrow)" />
      <path d="M818,240 L868,226" stroke={BLUE} strokeWidth={1.5} fill="none" markerEnd="url(#arrow)" />
      <Label x={630} y={210} size={8.5} color={BLUE} anchor="middle">Prisma · :5432</Label>

      {/* ── deploy path (dashed grey) ── */}
      <path d="M184,372 L410,290" stroke={GREY} strokeWidth={1.25} fill="none" strokeDasharray="4 3" markerEnd="url(#arrow)" />
      <Label x={260} y={352} size={8.5} color={GREY}>CI/CD deploy (SSH)</Label>

      {/* ── logs path (dashed yellow) ── */}
      <path d="M560,306 L560,470" stroke={YELLOW} strokeWidth={1.25} fill="none" strokeDasharray="4 3" markerEnd="url(#arrowY)" />
      <path d="M560,470 L734,500" stroke={YELLOW} strokeWidth={1.25} fill="none" strokeDasharray="4 3" markerEnd="url(#arrowY)" />
      <Label x={568} y={396} size={8.5} color={YELLOW}>logs</Label>

      {/* legend */}
      <line x1={16} y1={565} x2={44} y2={565} stroke={BLUE} strokeWidth={1.5} />
      <Label x={52} y={569} size={9} color={GREY} weight={400}>request path</Label>
      <line x1={168} y1={565} x2={196} y2={565} stroke={GREY} strokeWidth={1.25} strokeDasharray="4 3" />
      <Label x={204} y={569} size={9} color={GREY} weight={400}>deploy (CI/CD)</Label>
      <line x1={330} y1={565} x2={358} y2={565} stroke={YELLOW} strokeWidth={1.25} strokeDasharray="4 3" />
      <Label x={366} y={569} size={9} color={GREY} weight={400}>logs</Label>
    </svg>
  );
}
