import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente Card reutilizável para exibir conteúdo em um formato de cartão
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Conteúdo do card
 * @param {string} props.title - Título opcional do card
 * @param {string} props.subtitle - Subtítulo opcional do card
 * @param {string} props.className - Classes CSS adicionais
 * @param {boolean} props.noPadding - Se verdadeiro, remove o padding interno
 * @param {boolean} props.noShadow - Se verdadeiro, remove a sombra
 * @param {string} props.headerClassName - Classes CSS adicionais para o cabeçalho
 * @param {string} props.bodyClassName - Classes CSS adicionais para o corpo
 * @param {React.ReactNode} props.footer - Conteúdo opcional do rodapé
 * @param {string} props.footerClassName - Classes CSS adicionais para o rodapé
 * @param {React.ReactNode} props.actions - Ações do card (botões, links, etc.)
 * @param {Function} props.onClick - Função de callback para clique no card
 */
const Card = ({
  children,
  title,
  subtitle,
  className = '',
  noPadding = false,
  noShadow = false,
  noBorder = false,
  headerClassName = '',
  bodyClassName = '',
  footer,
  footerClassName = '',
  actions,
  onClick,
}) => {
  // Classes base do card
  const cardClasses = `
    ${className}
    bg-white rounded-lg my-12 relative
    ${noShadow ? '' : 'shadow'}   
    ${noBorder ? '' : 'border-[1px] border-gray-200'}
    ${onClick ? 'cursor-pointer transition-all hover:shadow-lg' : ''}
  `;

  // Classes para o corpo do card
  const bodyClasses = `
    ${noPadding ? '' : 'p-4'}
    ${bodyClassName}
  `;

  // Classes para o cabeçalho do card
  const headerClasses = `
    ${noPadding ? '' : 'px-4 py-3'}
    border-b border-gray-200    
    bg-gray-50 text-violet-700 text-lg font-medium mb-6 pb-4
    ${headerClassName}
  `;

  // Classes para o rodapé do card
  const footerClasses = `
    ${noPadding ? '' : 'px-4 py-3'}
    border-t border-gray-200
    ${footerClassName}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Cabeçalho do card (opcional) */}
      {(title || subtitle || actions) && (
        <div className={headerClasses}>
          <div className="flex justify-between items-center">
            <div>
              {title && <h3>{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            {actions && <div className="flex space-x-2">{actions}</div>}
          </div>
        </div>
      )}

      {/* Corpo do card */}
      <div className={bodyClasses}>{children}</div>

      {/* Rodapé do card (opcional) */}
      {footer && <div className={footerClasses}>{footer}</div>}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  noPadding: PropTypes.bool,
  noShadow: PropTypes.bool,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footer: PropTypes.node,
  footerClassName: PropTypes.string,
  actions: PropTypes.node,
  onClick: PropTypes.func,
};

export default Card; 