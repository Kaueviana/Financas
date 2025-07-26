const tbody = document.querySelector("tbody");
const descricao = document.querySelector("#desc");
const valo = document.querySelector("#valo");
const type = document.querySelector("#type");
const dataInput = document.querySelector("#data");
const botaoN = document.querySelector("#botaoN");

const entradas = document.querySelector(".entradas");
const saidas = document.querySelector(".saidas");
const total = document.querySelector(".total");

const dataInicio = document.getElementById('dataInicio');
const dataFim = document.getElementById('dataFim');
const btnFiltrar = document.getElementById('botaoFiltrar');

const btnResumo = document.getElementById('resumoDetalhado');
const modal = document.getElementById('modalResumo');
const closeModal = document.querySelector('.close');

const detalhesEntradas = document.getElementById('detalhesEntradas');
const detalhesSaidas = document.getElementById('detalhesSaidas');

const btnExportarCSV = document.getElementById('exportarCSV');

const API_URL = "http://localhost:3000/transacoes";

let dadosAtuais = [];

// Carregar transações
async function loadItens() {
    const res = await fetch(API_URL);
    const data = await res.json();
    dadosAtuais = data;
    tbody.innerHTML = '';
    data.forEach(insertItem);
    calcularTotais(data);
}

// Adicionar transação
botaoN.onclick = async () => {
    if (descricao.value === "" || valo.value === "" || type.value === "" || dataInput.value === "") {
        return alert("Preencha todos os campos!");
    }

   const novaTransacao = {
    descricao: descricao.value,
    valor: parseFloat(valo.value).toFixed(2),
    tipo: type.value,
    data: dataInput.value
   };

    await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaTransacao),
    });

    descricao.value = "";
    valo.value = "";
    dataInput.value = "";

    loadItens();
};

// Excluir transação
async function deleteItem(id) {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadItens();
}

// Inserir item na tabela
function insertItem(item) {
    let tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${item.descricao}</td>
        <td>R$ ${item.valor}</td>
        <td class="columnType">
            ${item.tipo === "Entrada"
                ? '<i class="bx bx-chevron-up-circle"></i>'
                : '<i class="bx bx-chevron-down-circle"></i>'}
        </td>
        <td>${item.data}</td>
        <td class="columnAction">
            <button onclick="deleteItem(${item.id})">
                <i class="bx bx-trash"></i>
            </button>
        </td>
    `;
    tbody.appendChild(tr);
}

// Calcular totais
function calcularTotais(transacoes) {
    let totalEntradas = 0;
    let totalSaidas = 0;

    transacoes.forEach((item) => {
        if (item.tipo === "Entrada") {
            totalEntradas += parseFloat(item.valor);
        } else {
            totalSaidas += parseFloat(item.valor);
        }
    });

    entradas.innerHTML = totalEntradas.toFixed(2);
    saidas.innerHTML = totalSaidas.toFixed(2);
    total.innerHTML = (totalEntradas - totalSaidas).toFixed(2);
}

// Filtro por data
btnFiltrar.addEventListener('click', () => {
    const inicio = new Date(dataInicio.value);
    const fim = new Date(dataFim.value);

    const filtrados = dadosAtuais.filter(item => {
        const dataItem = new Date(item.data);
        return dataItem >= inicio && dataItem <= fim;
    });

    tbody.innerHTML = '';
    filtrados.forEach(insertItem);
    calcularTotais(filtrados);
});

// Resumo detalhado
btnResumo.addEventListener('click', () => {
    mostrarResumoDetalhado();
    modal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

function mostrarResumoDetalhado() {
    detalhesEntradas.innerHTML = '';
    detalhesSaidas.innerHTML = '';

    dadosAtuais.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.descricao} - R$ ${item.valor} - ${item.data}`;
        if (item.tipo === 'Entrada') {
            detalhesEntradas.appendChild(li);
        } else {
            detalhesSaidas.appendChild(li);
        }
    });
}

// Exportar CSV
btnExportarCSV.addEventListener('click', () => {
    let csv = 'Descrição,Valor,Tipo,Data\n';
    dadosAtuais.forEach(item => {
        csv += `${item.descricao},${item.valor},${item.tipo},${item.data}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'financeiro.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});

loadItens();
