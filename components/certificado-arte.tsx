import { periodo, tituloDoTipo, dataExtenso, type Certificado } from "@/lib/certificados";

// A arte do certificado (modelo oficial Tu Prof), em unidades relativas à largura:
// cabe no celular e sai em A4 deitado na impressão/PDF.
const u = (px: number) => `${(px / 11.23).toFixed(3)}cqw`;

export default function CertificadoArte({ c, verificacao }: { c: Certificado; verificacao: string }) {
  const quando = periodo(c.inicio, c.fim);
  const carga = c.carga_horaria ? (
    <>
      , com carga horária de <strong style={{ color: "#F7F4EE" }}>{c.carga_horaria} {c.carga_horaria === 1 ? "hora" : "horas"}</strong>
    </>
  ) : null;

  return (
    <div className="certificado-caixa" style={{ containerType: "inline-size", width: "100%", maxWidth: 1123 }}>
      <div
        style={{
          aspectRatio: "1123 / 794",
          boxSizing: "border-box",
          padding: u(24),
          fontFamily: "'Arimo', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          background:
            "linear-gradient(118deg, #06101B 0%, #0D2340 18%, #2A5A93 34%, #7FA6D6 42%, #1D4475 52%, #0B1C33 70%, #1A3A63 88%, #07111D 100%)",
          WebkitPrintColorAdjust: "exact",
          printColorAdjust: "exact",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            border: "1px solid #C8A66B",
            borderRadius: u(6),
            background: "#0D1B2A",
            padding: `${u(52)} ${u(76)} ${u(46)}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            color: "#F7F4EE",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-tuprof.png" alt="Tu Prof" style={{ width: u(260), height: "auto", display: "block" }} />
          <div style={{ marginTop: u(30), fontSize: u(17), fontWeight: 700, letterSpacing: "0.32em", color: "#C8A66B", textTransform: "uppercase" }}>
            {tituloDoTipo(c.tipo)}
          </div>
          <div style={{ marginTop: u(28), fontSize: u(20), color: "#C9D6E4" }}>Certificamos que</div>
          <div style={{ marginTop: u(12), fontSize: u(52), lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.03em" }}>{c.nome_impresso}</div>
          <div style={{ marginTop: u(20), width: u(150), height: u(6), borderRadius: u(4), background: "#C8A66B" }} />
          <p style={{ margin: `${u(26)} 0 0`, maxWidth: u(800), fontSize: u(21), lineHeight: 1.55, color: "#DCE6F2" }}>
            {c.tipo === "participacao" ? "participou do " : "concluiu "}
            <strong style={{ color: "#F7F4EE" }}>{c.titulo}</strong>
            {c.tipo === "participacao" ? (c.empresa ? `, oferecido pela Tu Prof à equipe da ${c.empresa}` : ", oferecido pela Tu Prof") : " na Tu Prof"}
            {quando ? `, ${quando}` : ""}
            {carga}.
          </p>
          <div style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ width: u(320), height: 1, background: "rgba(220,230,242,0.6)" }} />
              <div style={{ marginTop: u(12), fontSize: u(19), fontWeight: 700 }}>Tuanne Mercedes</div>
              <div style={{ marginTop: u(2), fontSize: u(17), color: "#C9D6E4" }}>Fundadora da Tu Prof</div>
            </div>
            <div style={{ textAlign: "right", fontSize: u(15), lineHeight: 1.6, color: "#C9D6E4" }}>
              Emitido em {dataExtenso(c.emitido_em)}
              <br />
              Código {c.codigo}
              <br />
              Verifique em {verificacao}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
