document.addEventListener("DOMContentLoaded", () => {

  // ======================
  // CADASTRO DE PRODUTO
  // ======================
  const form = document.getElementById("form-cadastro")

  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault()

      const nome = document.getElementById("nome").value.trim()
      const quantidade = Number(document.getElementById("quantidade").value)
      const custo = Number(document.getElementById("custo").value)
      const preco = Number(document.getElementById("preco").value)

      if (!nome || quantidade <= 0 || custo <= 0 || preco <= 0) {
        alert("Preencha todos os campos corretamente.")
        return
      }

      let produtos = JSON.parse(localStorage.getItem("produtos")) || []

      const existe = produtos.some(
        p => p.nome.toLowerCase() === nome.toLowerCase()
      )

      if (existe) {
        alert("Produto já cadastrado.")
        return
      }

      produtos.push({ nome, quantidade, custo, preco })
      localStorage.setItem("produtos", JSON.stringify(produtos))

      alert("Produto cadastrado com sucesso!")
      form.reset()
    })
  }

  // ======================
  // ESTOQUE
  // ======================
  const tabela = document.getElementById("tabela-estoque")
  const pesquisa = document.getElementById("pesquisa")

  if (tabela) {
    let produtos = JSON.parse(localStorage.getItem("produtos")) || []

    function renderizarEstoque(lista = produtos) {
      tabela.innerHTML = ""

      lista.forEach((produto, index) => {
        const tr = document.createElement("tr")
        tr.innerHTML = `
          <td>${produto.nome}</td>
          <td>${produto.quantidade}</td>
          <td>R$ ${produto.custo.toFixed(2)}</td>
          <td>R$ ${produto.preco.toFixed(2)}</td>
          <td>
            <button onclick="entrada(${index})">+ Entrada</button>
            <button onclick="excluir(${index})">Excluir</button>
          </td>
        `
        tabela.appendChild(tr)
      })
    }

    window.entrada = index => {
      const valor = Number(prompt("Quantidade de entrada:"))
      if (valor > 0) {
        produtos[index].quantidade += valor
        salvar()
      }
    }

    window.excluir = index => {
      if (confirm("Deseja excluir este produto?")) {
        produtos.splice(index, 1)
        salvar()
      }
    }

    function salvar() {
      localStorage.setItem("produtos", JSON.stringify(produtos))
      renderizarEstoque()
      carregarProdutosVenda()
    }

    if (pesquisa) {
      pesquisa.addEventListener("input", () => {
        const termo = pesquisa.value.toLowerCase()
        const filtrados = produtos.filter(p =>
          p.nome.toLowerCase().includes(termo)
        )
        renderizarEstoque(filtrados)
      })
    }

    renderizarEstoque()
  }

  // ======================
  // VENDAS
  // ======================
  let carrinho = []

  function carregarProdutosVenda() {
    const select = document.getElementById("produto-select")
    if (!select) return

    const produtos = JSON.parse(localStorage.getItem("produtos")) || []
    select.innerHTML = '<option value="">Selecione um produto</option>'

    produtos.forEach((p, index) => {
      if (p.quantidade > 0) {
        const option = document.createElement("option")
        option.value = index
        option.textContent = `${p.nome} (Estoque: ${p.quantidade})`
        select.appendChild(option)
      }
    })
  }

  const btnAdd = document.getElementById("btn-adicionar")
  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      const produtos = JSON.parse(localStorage.getItem("produtos")) || []
      const index = document.getElementById("produto-select").value
      const qtd = Number(document.getElementById("quantidade-venda").value)

      if (index === "" || qtd <= 0) return

      if (qtd > produtos[index].quantidade) {
        alert("Quantidade maior que o estoque.")
        return
      }

      const produto = produtos[index]
      carrinho.push({
        index,
        nome: produto.nome,
        qtd,
        preco: produto.preco,
        subtotal: produto.preco * qtd
      })

      atualizarCarrinho()
    })
  }

  function atualizarCarrinho() {
    const tbody = document.getElementById("carrinho")
    const totalSpan = document.getElementById("total-venda")

    if (!tbody || !totalSpan) return

    tbody.innerHTML = ""
    let total = 0

    carrinho.forEach(item => {
      total += item.subtotal
      const tr = document.createElement("tr")
      tr.innerHTML = `
        <td>${item.nome}</td>
        <td>${item.qtd}</td>
        <td>R$ ${item.preco.toFixed(2)}</td>
        <td>R$ ${item.subtotal.toFixed(2)}</td>
      `
      tbody.appendChild(tr)
    })

    totalSpan.textContent = `R$ ${total.toFixed(2)}`
  }

  window.finalizarVenda = () => {
    if (carrinho.length === 0) return

    let produtos = JSON.parse(localStorage.getItem("produtos")) || []
    let caixa = Number(localStorage.getItem("caixa")) || 0
    let totalVenda = 0

    carrinho.forEach(item => {
      produtos[item.index].quantidade -= item.qtd
      totalVenda += item.subtotal
    })

    caixa += totalVenda

    localStorage.setItem("produtos", JSON.stringify(produtos))
    localStorage.setItem("caixa", caixa)

    carrinho = []
    atualizarCarrinho()
    carregarProdutosVenda()
    atualizarDashboard()
  }

  // ======================
  // DASHBOARD
  // ======================
  function atualizarDashboard() {
    const caixa = Number(localStorage.getItem("caixa")) || 0
    const caixaEl = document.getElementById("caixa")
    if (caixaEl) {
      caixaEl.textContent = `R$ ${caixa.toFixed(2)}`
    }
  }

  carregarProdutosVenda()
  atualizarDashboard()
})
