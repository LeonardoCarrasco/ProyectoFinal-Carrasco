
const seleccionMoneda1 = document.querySelector('#monedaInicial')
const seleccionMoneda2 = document.querySelector('#monedaAConvertir')
const inputMonto = document.querySelector('#cantidad')
const convertirBtn = document.querySelector('#convertirBtn')
const resultadoSpan = document.querySelector('#resultado')
const btnHistorial = document.querySelector('#btnHistorial');
const historialDiv = document.querySelector('#item');

const monedasJson = './json/monedas.json';
// const monedasJson = 'https://raw.githubusercontent.com/LeonardoCarrasco/ProyectoFinal-Carrasco/main/json/monedas.json';

async function obtenerDatos(URL) {
    try {
      const resp = await fetch(URL);
  
      if (!resp.ok) {
        throw new Error('Error');
      }
      const monedas = await resp.json();

      guardaDivisasLocalStorage(monedas);

    } catch (error) {
      console.error('Error:', error);
    }
  }

  function guardaDivisasLocalStorage (array){
    localStorage.setItem('divisasArr', JSON.stringify(array));
  }

  obtenerDatos(monedasJson)

// Obtener divisas de local storage

  function obtenerDivisas (){
    const datos = localStorage.getItem('divisasArr');

  if (datos) {
    const datosParsed = JSON.parse(datos);
    return datosParsed
  } else {
    Swal.fire({
      icon: "error",
      title: "Datos no encontrados",
      text: "No se encontraton datos en Local Storage"
    });
  }
  }

function cargarMonedasEnSelect(){
    const getMonedas = JSON.parse(localStorage.getItem('divisasArr'));
    if (!getMonedas) { 
      Swal.fire({
        icon: "error",
        title: "Datos no encontrados",
        text: "No se encontraton datos en Local Storage"
      });
        return;
    }
    
      const conversionRates = getMonedas.conversion_rates;
      const codigoMonedas = Object.keys(conversionRates);
      codigoMonedas.forEach(moneda => {
        const valorMoneda = conversionRates[moneda]
        const opcion = document.createElement('option');
        const opcion2 = document.createElement('option');
        opcion.value = moneda;
        opcion.textContent= `${moneda} (${valorMoneda.toFixed()})`
        opcion2.value = moneda;
        opcion2.textContent = `${moneda} (${valorMoneda.toFixed()})`
        seleccionMoneda1.appendChild(opcion);
        seleccionMoneda2.appendChild(opcion2)
    });
    
}

cargarMonedasEnSelect();

//  En esta funcion vamos a tomar 2 parametros. monedaElegida que la tomaremos del eventListener y luego 
//  el select que corresponda para deshabilitar la opcion de elegir la misma moneda

function deshabiliarSeleccion (monedaElegida, selectElegido){
    const opciones = selectElegido.querySelectorAll ('option');
    opciones.forEach(opcion => {
        if(opcion.value === monedaElegida){
            opcion.disabled = true;
        }
        else{
            opcion.disabled = false;
        }
    })
}

seleccionMoneda1.addEventListener("change",(e) => {
    const monedaElegida = e.target.value;
    deshabiliarSeleccion(monedaElegida, seleccionMoneda2);
}),

seleccionMoneda2.addEventListener("change",(e) => {
    const monedaElegida = e.target.value;
    deshabiliarSeleccion(monedaElegida, seleccionMoneda1);
}),



convertirBtn.addEventListener("click", (e) =>{
    e.preventDefault();

    const monedaOrigen = seleccionMoneda1.value
    const monedaDestino = seleccionMoneda2.value;

    if(inputMonto.value != ""){

    const monto = inputMonto.value;
    
    const monedasValores = obtenerDivisas();
    const resultado= convertirMoneda(monedaOrigen, monedaDestino, monto, monedasValores).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    // const resultadoFormateado = resultado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    if (localStorage.getItem('historial')) {
        agregarAlHistorial(monto, monedaOrigen, monedaDestino, resultado);
    }
    else{
        const fecha = new Date().toLocaleDateString();
        const historial = [];

        const conversion = {
            fecha,
            monto,
            monedaOrigen,
            monedaDestino,
            resultado
          };

          historial.push(conversion)

        localStorage.setItem('historial',JSON.stringify(historial));
        actualizarHistorial()
    }

    resultadoSpan.textContent = `$ ${resultado} ${monedaDestino}.`;

    }
    else{
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "COMPLETA LOS CAMPOS!"
      });
    }

    inputMonto.value=''
}   
)

function convertirMoneda(monedaOrigen, monedaDestino, montoConvertir, monedasValores){

    if(Math.sign(montoConvertir) == 1){
      if (monedaOrigen === "USD") {
        return montoConvertir * monedasValores.conversion_rates[monedaDestino];
      }
      
      if (monedaDestino === "USD") {
        return montoConvertir / monedasValores.conversion_rates[monedaOrigen];
      }
      
      const montoEnUSD = montoConvertir / monedasValores.conversion_rates[monedaOrigen];
      const res = montoEnUSD * monedasValores.conversion_rates[monedaDestino];

      return res.toFixed();
    }
    else{
      Swal.fire({
        icon: "error",
        text: "DEBE DE INGRESAR UN NUMERO POSITIVO!"
      });
        inputMonto.value = ""

        return
    }   
    
}

// Codigo Historial de conversiones

function agregarAlHistorial(monto, monedaOrigen, monedaDestino, resultado) {
    const historial = JSON.parse(localStorage.getItem('historial'));
    const fecha = new Date().toLocaleDateString();

    const conversion = {
      fecha,
      monto,
      monedaOrigen,
      monedaDestino,
      resultado
    };

    historial.push(conversion);
    localStorage.setItem('historial', JSON.stringify(historial));
    
    actualizarHistorial();
  }

function actualizarHistorial() {

  if (localStorage.getItem('historial')) {
    const historial = JSON.parse(localStorage.getItem('historial'));
    historialDiv.innerHTML = '';

    if (historial.length === 0) {
      historialDiv.innerHTML = '<p>Historial vacio.</p>';
    } else {
      historial.forEach(conversion => {
        const div = document.createElement('div');
        div.textContent = `Fecha: ${conversion.fecha} - convertir:  ${conversion.monto} ${conversion.monedaOrigen} A => ${conversion.monedaDestino} Resultado: $ ${conversion.resultado}`;
        div.classList.add('fw-medium', 'fst-italic');
        historialDiv.appendChild(div);
      });
    }
  }
  else{
    historialDiv.innerHTML = '<p>Historial vacio.</p>';
  }
    
  }

  function borrarHistorial() {
    localStorage.setItem('historial', [])
    historialDiv.innerHTML='Historial Vacio';
  }

  actualizarHistorial()

  btnHistorial.addEventListener('click', ()=> {
    if(localStorage.getItem('historial')){
      Swal.fire({
        title: '¿Estás seguro de que quieres borrar el historial?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, borrar historial',
        cancelButtonText: 'No, cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            borrarHistorial(); 
        }
    });
    }
  });


  //////  CODIGO GRAFICO INTERACTIVO ////////

  const ctx = document.querySelector('#graficosMonedas').getContext('2d');

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: Object.keys(localStorage.getItem('divisasArr')),
        datasets: [{
            label: 'Tasa de Cambio respecto al USD',
            data: Object.values(localStorage.getItem('divisasArr')),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            barPercentage: 2.5,
            categoryPercentage: .5
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            }
        }
    }
});