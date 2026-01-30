function forwardCalc(){
  const rho15=parseFloat(document.getElementById("rho15").value);
  const T=parseFloat(document.getElementById("temp1").value);
  const alpha=parseFloat(document.getElementById("fuel1").value);
  const V=document.getElementById("vol1").value;

  if(isNaN(rho15)||isNaN(T)){
    alert("Enter Density @15°C and Temperature");
    return;
  }

  const rhoT=rho15/(1+alpha*(T-15));
  const VCF=rhoT/rho15;

  let html=`<b>Density @ ${T} °C:</b> ${rhoT.toFixed(2)} kg/m³<br>
            <b>VCF:</b> ${VCF.toFixed(5)}`;

  if(V!==""){
    html+=`<br><b>Volume @ 15 °C:</b> ${(parseFloat(V)*VCF).toFixed(2)} litres`;
  }

  out1.style.display="block";
  out1.innerHTML=html;
}

function reverseCalc(){
  const rhoT=parseFloat(document.getElementById("rhoT").value);
  const T=parseFloat(document.getElementById("temp2").value);
  const alpha=parseFloat(document.getElementById("fuel2").value);
  const V=document.getElementById("vol2").value;

  if(isNaN(rhoT)||isNaN(T)){
    alert("Enter Observed Density and Temperature");
    return;
  }

  const rho15=rhoT*(1+alpha*(T-15));
  const VCF=rhoT/rho15;

  let html=`<b>Density @ 15 °C:</b> ${rho15.toFixed(2)} kg/m³<br>
            <b>VCF:</b> ${VCF.toFixed(5)}`;

  if(V!==""){
    html+=`<br><b>Volume @ 15 °C:</b> ${(parseFloat(V)*VCF).toFixed(2)} litres`;
  }

  out2.style.display="block";
  out2.innerHTML=html;
}
