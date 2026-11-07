// Apply small, checked adapters to generated copies; never edit recovered artifacts.
export function patchLegacy(source) {
  let s = source;
  const replace = (from, to) => {
    if (s.split(from).length !== 2)
      throw Error("Legacy adapter mismatch: " + from.slice(0, 90));
    s = s.replace(from, to);
  };
  replace(
    "function I(e,t){let n=F(e)",
    "function I(e,t){if(t===`lab`&&globalThis.__compactClinical)return globalThis.__compactClinical.parseLabText(e,F(e));let n=F(e)",
  );
  replace(
    "function ge(e,t){let n=e.filter(e=>e.selected)",
    "function ge(e,t){if(t===`lab`&&globalThis.__compactClinical)return globalThis.__compactClinical.buildLabResults(e);let n=e.filter(e=>e.selected)",
  );
  const start = "h.map((e,t)=>(0,m.jsxs)(`div`,{className:`import-row`";
  const end = "},t)),(0,m.jsx)(`button`,{type:`button`,onClick:()=>g(e=>[...e,";
  const a = s.indexOf(start),
    b = s.indexOf(end, a);
  if (a < 0 || b < 0) throw Error("PDF review adapter mismatch");
  const old = s.slice(a, b + "},t))".length);
  s =
    s.slice(0, a) +
    "(globalThis.__compactClinical?globalThis.__compactClinical.importReview({rows:h,type:s,onChange:N,onRows:g,fields:x.inbody},f):" +
    old +
    ")" +
    s.slice(b + "},t))".length);
  replace(
    "[`summary`,`Atención actual`],[`energy`,`Gasto energético`],[`calculator`,`Calculator`]",
    "[`summary`,`Resumen`]",
  );
  const summaryStart = "(0,m.jsxs)(`div`,{hidden:le!==`summary`,children:[";
  const summaryEnd = "},`${P.id}-${T}`),le===`evolution`";
  const c = s.indexOf(summaryStart),
    d = s.indexOf(summaryEnd, c);
  if (c < 0 || d < 0) throw Error("Summary adapter mismatch");
  s =
    s.slice(0, c) +
    "(0,m.jsx)(CompactSummary,{patient:P,records:re,plans:o,onOpen:date=>window.dispatchEvent(new CustomEvent(`clinical-request-visit`,{detail:{patientId:P.id,date}})),onReview:()=>ue(`evolution`)}),le===`evolution`" +
    s.slice(d + summaryEnd.length);
  const control =
    "(0,m.jsx)(`div`,{hidden:![`summary`,`energy`,`calculator`].includes(le),children:(0,m.jsx)(Ee,{patientId:P.id,date:T,plans:o,view:le,records:re,onDirty:e=>xe(`control`,e),onSaved:()=>Xe()},`control-${P.id}-${T}`)}),";
  replace(control, "");
  replace(
    "(0,m.jsx)(de,{records:re,plans:o,date:T,onReview:()=>ue(`evolution`),onSelect:e=>{e!==T&&Se()&&(be({}),O(e))}}),!P.is_demo&&(0,m.jsx)(N,{patientId:P.id,date:T,revision:ge}),",
    "",
  );
  replace(
    'className:`card attention-bar`,"aria-label":`Atención actual`',
    'className:`card attention-bar`,style:le===`summary`?{display:`none`}:void 0,"aria-label":`Fecha de archivos y evolución`',
  );
  const effect =
    "(0,f.useEffect)(()=>{O(E()),be({}),A({group:`anthropometry`,metric:``})},[P?.id])";
  replace(
    effect,
    "(0,f.useEffect)(()=>{let handler=e=>{if(Se()){let d=e.detail;if(d.date)O(d.date);ue(d.destination===`Documentos`?`documents`:d.destination===`Evolución`?`evolution`:d.destination===`Indicaciones`?`orders`:`summary`)}};window.addEventListener(`clinical-open-tools`,handler);return()=>window.removeEventListener(`clinical-open-tools`,handler)},[R])," +
      effect,
  );
  replace(
    "function S(e){return typeof e==`string`",
    "x.habits=x.habits.filter(field=>![`stepsWeekly`,`steps`].includes(field.key));function S(e){return typeof e==`string`",
  );
  const oldEdit = "onEdit:e=>z({kind:e.kind,record:e})";
  if (!s.includes(oldEdit)) throw Error("Evolution edit adapter mismatch");
  s = s.replaceAll(
    oldEdit,
    "onEdit:e=>[`lab`,`inbody`].includes(e.kind)?z({kind:e.kind,record:e}):window.dispatchEvent(new CustomEvent(`clinical-request-visit`,{detail:{patientId:P.id,date:e.attention_date||e.date}}))",
  );
  s +=
    '\nfunction CompactSummary(props){let[ready,setReady]=f.useState(!!globalThis.__compactClinical);f.useEffect(()=>{let notify=()=>setReady(true);window.addEventListener("compact-clinical-ready",notify);return()=>window.removeEventListener("compact-clinical-ready",notify)},[]);return globalThis.__compactClinical?globalThis.__compactClinical.summary(props,f):f.createElement("p",null,"Preparando resumen…")}\n';
  return s;
}
export function patchPdfReader(source) {
  const start = "for(let e of u.items)if(`str`in e)",
    end = "h+=p;let g=";
  const a = source.indexOf(start),
    b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw Error("PDF layout adapter mismatch");
  const old = source.slice(a, b + "h+=p;".length);
  return (
    source.slice(0, a) +
    "if(globalThis.__compactClinical)h=globalThis.__compactClinical.layoutPdfItems(u.items);else{" +
    old +
    "}" +
    source.slice(b + "h+=p;".length)
  );
}
