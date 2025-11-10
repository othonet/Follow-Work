// Helpers do Handlebars
module.exports = {
  // Helper para igualdade
  eq: function(a, b) {
    return a === b;
  },

  // Helper para maior ou igual
  gte: function(a, b) {
    return a >= b;
  },

  // Helper para verificar se data está no passado
  isPast: function(date) {
    return new Date(date) < new Date();
  },

  // Helper para formatar data
  formatDate: function(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },

  // Helper para formatar data e hora para input datetime-local
  formatDateTime: function(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  },

  // Helper para verificar se um valor está em um array
  inArray: function(array, value) {
    if (!array || !Array.isArray(array)) return false;
    return array.includes(value);
  }
};

