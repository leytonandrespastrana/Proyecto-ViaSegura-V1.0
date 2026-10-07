const key = "viasegura_incidentes";
const seed = [
  {id:1,fecha:"2026-09-18",hora:"18:20",tipo:"Colisión",via:"Seca",ubicacion:"Calle 24 con carrera 29",municipio:"Yopal",vehiculos:2,lesionados:1,factor:"Exceso de velocidad",descripcion:"Colisión entre automóvil y motocicleta."},
  {id:2,fecha:"2026-09-20",hora:"08:10",tipo:"Caída de motociclista",via:"Mojada",ubicacion:"Carrera 19 con calle 10",municipio:"Yopal",vehiculos:1,lesionados:0,factor:"Condiciones de la vía",descripcion:"Motociclista pierde estabilidad en superficie mojada."}
];
let incidents = JSON.parse(localStorage.getItem(key) || "null") || seed;
const $ = id => document.getElementById(id);
const save = () => localStorage.setItem(key, JSON.stringify(incidents));
const nextCode = id => `VS-${String(id).slice(-4).padStart(4,"0")}`;

function renderHome(){
  if($("totalMini")) $("totalMini").textContent = incidents.length;
  if($("activeMini")) $("activeMini").textContent = incidents.filter(x=>x.lesionados>0||x.factor==="Exceso de velocidad").length;
}

function renderList(){
  if(!$("incidentList")) return;
  const q = ($("search")?.value || "").toLowerCase().trim();
  const type = $("filterType")?.value || "";
  const list = incidents.filter(x =>
    (!type || x.tipo === type) &&
    [x.ubicacion,x.municipio,x.tipo,x.factor,x.descripcion].join(" ").toLowerCase().includes(q)
  );
  if($("resultCount")) $("resultCount").textContent = `${list.length} ${list.length===1?"reporte":"reportes"}`;
  $("incidentList").innerHTML = list.length ? list.map(x => `
    <article class="incident">
      <div class="incident-head">
        <div><span class="detail-code">${nextCode(x.id)}</span><h3 style="margin-top:9px">${escapeHtml(x.tipo)}</h3><small>${escapeHtml(x.fecha)} · ${escapeHtml(x.hora)}</small></div>
        <span class="badge">${escapeHtml(x.municipio)}</span>
      </div>
      <p><b>Ubicación:</b> ${escapeHtml(x.ubicacion)}</p>
      <p><b>Factor:</b> ${escapeHtml(x.factor)}</p>
      <div class="incident-footer"><span>${x.vehiculos} vehículo(s) · ${x.lesionados} lesionado(s)</span><a class="text-link" href="detalle.html?id=${encodeURIComponent(x.id)}">Ver detalle →</a></div>
    </article>`).join("") : `<div class="incident"><b>No hay reportes que coincidan con la búsqueda.</b></div>`;
}

function renderStats(){
  if(!$("total")) return;
  $("total").textContent=incidents.length;
  $("injured").textContent=incidents.filter(x=>x.lesionados>0).length;
  $("speed").textContent=incidents.filter(x=>x.factor==="Exceso de velocidad").length;
  $("alcohol").textContent=incidents.filter(x=>x.factor==="Posible alcohol").length;
  renderBars("typeChart", ["Colisión","Atropello","Caída de motociclista","Choque con objeto","Otro"], x=>x.tipo);
  renderBars("factorChart", ["Exceso de velocidad","Posible alcohol","Distracción","Condiciones de la vía","No determinado"], x=>x.factor);
}
function renderBars(id, labels, getter){
  const el=$(id); if(!el)return;
  const values=labels.map(label=>incidents.filter(x=>getter(x)===label).length);
  const max=Math.max(1,...values);
  el.innerHTML=labels.map((label,i)=>`<div class="bar-row"><span>${escapeHtml(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${(values[i]/max)*100}%"></div></div><b class="bar-value">${values[i]}</b></div>`).join("");
}

function renderDetail(){
  if(!$("detailCard")) return;
  const id=new URLSearchParams(location.search).get("id");
  const item=incidents.find(x=>String(x.id)===String(id));
  if(!item){$("detailTitle").textContent="Reporte no encontrado";$("detailSubtitle").textContent="El incidente solicitado no existe en este navegador.";return;}
  $("detailTitle").textContent=item.tipo;
  $("detailSubtitle").innerHTML=`<span class="detail-code">${nextCode(item.id)}</span> · ${escapeHtml(item.municipio)}`;
  $("detailCard").innerHTML=`
    <div class="detail-grid">
      ${detailItem("Fecha",item.fecha)}${detailItem("Hora",item.hora)}
      ${detailItem("Municipio",item.municipio)}${detailItem("Ubicación",item.ubicacion)}
      ${detailItem("Condición de vía",item.via)}${detailItem("Vehículos involucrados",item.vehiculos)}
      ${detailItem("Personas lesionadas",item.lesionados)}${detailItem("Factor asociado",item.factor)}
    </div>
    <h3>Descripción</h3><p class="detail-description">${escapeHtml(item.descripcion)}</p>
    <div class="form-actions"><a class="btn secondary" href="incidentes.html">← Volver</a><a class="btn primary" href="reportar.html">Nuevo reporte</a></div>`;
}
function detailItem(label,value){return `<div class="detail-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`}

function initForm(){
  if(!$("incidentForm")) return;
  $("fecha").value=new Date().toISOString().slice(0,10);
  $("incidentForm").addEventListener("submit",e=>{
    e.preventDefault();
    const item={id:Date.now(),fecha:$("fecha").value,hora:$("hora").value,tipo:$("tipo").value,via:$("via").value,ubicacion:$("ubicacion").value.trim(),municipio:$("municipio").value.trim(),vehiculos:Number($("vehiculos").value),lesionados:Number($("lesionados").value),factor:$("factor").value,descripcion:$("descripcion").value.trim()};
    incidents.unshift(item);save();e.target.reset();$("fecha").value=new Date().toISOString().slice(0,10);
    $("formMsg").className="message success";$("formMsg").textContent=`✓ Reporte ${nextCode(item.id)} guardado correctamente.`;
  });
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
$("search")?.addEventListener("input",renderList);
$("filterType")?.addEventListener("change",renderList);
initForm();renderHome();renderList();renderStats();renderDetail();