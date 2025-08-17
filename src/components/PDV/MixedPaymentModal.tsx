import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, QrCode, Banknote, Plus, Minus, AlertCircle } from 'lucide-react';

interface PaymentPart {
  method: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito';
  amount: number;
}

interface MixedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentParts: PaymentPart[], changeAmount?: number) => void;
  totalAmount: number;
  title?: string;
}

const MixedPaymentModal: React.FC<MixedPaymentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalAmount,
  title = "Pagamento Misto"
}) => {
  const [paymentParts, setPaymentParts] = useState<PaymentPart[]>([
    { method: 'dinheiro', amount: 0 },
    { method: 'pix', amount: 0 }
  ]);
  const [changeAmount, setChangeAmount] = useState<number>(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito'
    };
    return labels[method] || method;
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'dinheiro':
        return <Banknote size={16} className="text-green-600" />;
      case 'pix':
        return <QrCode size={16} className="text-blue-600" />;
      case 'cartao_credito':
      case 'cartao_debito':
        return <CreditCard size={16} className="text-purple-600" />;
      default:
        return <DollarSign size={16} className="text-gray-600" />;
    }
  };

  const getTotalPaid = () => {
    return paymentParts.reduce((sum, part) => sum + part.amount, 0);
  };

  const getRemainingAmount = () => {
    return Math.max(0, totalAmount - getTotalPaid());
  };

  const getOverpaidAmount = () => {
    const total = getTotalPaid();
    return total > totalAmount ? total - totalAmount : 0;
  };

  const isValidPayment = () => {
    const total = getTotalPaid();
    const hasValidParts = paymentParts.some(part => part.amount > 0);
    return hasValidParts && total >= totalAmount;
  };

  const updatePaymentPart = (index: number, field: keyof PaymentPart, value: any) => {
    setPaymentParts(prev => prev.map((part, i) => 
      i === index ? { ...part, [field]: value } : part
    ));
  };

  const addPaymentPart = () => {
    setPaymentParts(prev => [...prev, { method: 'dinheiro', amount: 0 }]);
  };

  const removePaymentPart = (index: number) => {
    if (paymentParts.length > 1) {
      setPaymentParts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleConfirm = () => {
    if (!isValidPayment()) {
      alert('O valor total pago deve ser igual ou maior que o valor da venda');
      return;
    }

    // Filtrar apenas partes com valor > 0
    const validParts = paymentParts.filter(part => part.amount > 0);
    
    onConfirm(validParts, changeAmount);
  };

  // Calcular troco automaticamente quando há dinheiro
  useEffect(() => {
    const moneyPart = paymentParts.find(part => part.method === 'dinheiro');
    if (moneyPart && moneyPart.amount > 0) {
      const overpaid = getOverpaidAmount();
      setChangeAmount(overpaid);
    } else {
      setChangeAmount(0);
    }
  }, [paymentParts, totalAmount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <DollarSign size={24} className="text-purple-600" />
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Divida o pagamento entre diferentes métodos
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Total da Venda */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">Total da Venda:</span>
              <span className="text-2xl font-bold text-blue-800">
                {formatPrice(totalAmount)}
              </span>
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Formas de Pagamento</h3>
              <button
                onClick={addPaymentPart}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
              >
                <Plus size={14} />
                Adicionar
              </button>
            </div>

            <div className="space-y-3">
              {paymentParts.map((part, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700">
                      Pagamento {index + 1}
                    </h4>
                    {paymentParts.length > 1 && (
                      <button
                        onClick={() => removePaymentPart(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Método de Pagamento
                      </label>
                      <select
                        value={part.method}
                        onChange={(e) => updatePaymentPart(index, 'method', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="dinheiro">Dinheiro</option>
                        <option value="pix">PIX</option>
                        <option value="cartao_credito">Cartão de Crédito</option>
                        <option value="cartao_debito">Cartão de Débito</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor
                      </label>
                      <div className="relative">
                        <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={totalAmount}
                          value={part.amount}
                          onChange={(e) => updatePaymentPart(index, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="0,00"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      {getMethodIcon(part.method)}
                      <span className="text-gray-600">
                        {getMethodLabel(part.method)}: {formatPrice(part.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3">Resumo do Pagamento</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total da venda:</span>
                <span className="font-medium">{formatPrice(totalAmount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Total pago:</span>
                <span className={`font-medium ${
                  getTotalPaid() >= totalAmount ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPrice(getTotalPaid())}
                </span>
              </div>
              
              {getRemainingAmount() > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-600">Falta pagar:</span>
                  <span className="font-medium text-red-600">
                    {formatPrice(getRemainingAmount())}
                  </span>
                </div>
              )}
              
              {getOverpaidAmount() > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-600">Troco:</span>
                  <span className="font-medium text-green-600">
                    {formatPrice(getOverpaidAmount())}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Validação */}
          {!isValidPayment() && getTotalPaid() > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium text-sm">
                    Pagamento Incompleto
                  </p>
                  <p className="text-red-700 text-sm">
                    {getRemainingAmount() > 0 
                      ? `Ainda falta pagar ${formatPrice(getRemainingAmount())}`
                      : 'Configure pelo menos uma forma de pagamento'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isValidPayment()}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <DollarSign size={16} />
            Confirmar Pagamento
          </button>
        </div>
      </div>
    </div>
  );
};

export default MixedPaymentModal;