import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AnalyticsTracker = ({ pageId, gaId = null, pageComponents = [] }) => {
  const sessionStartRef = useRef(Date.now());
  const lastScrollPositionRef = useRef(0);
  const visitorIdRef = useRef(null);
  const hasTrackedPageviewRef = useRef(false);
  const componentsMapRef = useRef(new Map());
  
  // Preparar o mapa de componentes para rastreamento mais eficiente
  useEffect(() => {
    if (pageComponents && pageComponents.length > 0) {
      const map = new Map();
      pageComponents.forEach(component => {
        map.set(component.id, {
          id: component.id,
          type: component.type,
          content: component.content
        });
      });
      componentsMapRef.current = map;
      
      // Imprimir informações sobre os componentes carregados para debugging
      console.log(`Carregados ${pageComponents.length} componentes para rastreamento:`, 
        pageComponents.map(c => ({
          id: c.id,
          type: c.type,
          title: c.content.title || 'Sem título'
        }))
      );
    }
  }, [pageComponents]);
  
  // Função para rastrear eventos
  const trackEvent = async (eventType, componentId = null, data = {}) => {
    try {
      // Obter ou gerar ID do visitante (armazenado em localStorage)
      if (!visitorIdRef.current) {
        visitorIdRef.current = localStorage.getItem('visitorId') || uuidv4();
        localStorage.setItem('visitorId', visitorIdRef.current);
      }
      
      // Verificar se o pageId é válido
      if (!pageId) {
        console.error('pageId inválido:', pageId);
        return;
      }
      
      // Garantir que componentId seja um número se possível ou null caso contrário
      let parsedComponentId = null;
      if (componentId) {
        // Tentar converter para inteiro - o backend espera um número
        const numId = parseInt(componentId, 10);
        if (!isNaN(numId)) {
          parsedComponentId = numId;
        } else {
          // Se não for um número, manteremos a string original nos dados adicionais
          data.rawComponentId = componentId;
        }
      }
      
      // Adicionar dados do componente ao evento, se houver
      if (componentId && componentsMapRef.current.has(componentId)) {
        const component = componentsMapRef.current.get(componentId);
        data.componentType = component.type;
        data.componentTitle = typeof component.content.title === 'string' ? 
          component.content.title : '';
      }
      
      // Detectar dispositivo/navegador
      const ua = navigator.userAgent;
      let device = 'desktop';
      if (/Mobile|Android|iPhone/i.test(ua)) device = 'mobile';
      else if (/iPad|Tablet/i.test(ua)) device = 'tablet';
      
      // Detectar navegador
      let browser = 'unknown';
      if (/Chrome/i.test(ua)) browser = 'chrome';
      else if (/Firefox/i.test(ua)) browser = 'firefox';
      else if (/Safari/i.test(ua)) browser = 'safari';
      else if (/Edge/i.test(ua)) browser = 'edge';
      
      // Detectar sistema operacional
      let os = 'unknown';
      if (/Windows/i.test(ua)) os = 'windows';
      else if (/Mac/i.test(ua)) os = 'mac';
      else if (/Android/i.test(ua)) os = 'android';
      else if (/iOS/i.test(ua)) os = 'ios';
      
      // Converter pageId para número (o backend espera um número)
      let parsedPageId;
      try {
        parsedPageId = parseInt(pageId, 10);
        if (isNaN(parsedPageId)) {
          console.error('pageId não é um número válido:', pageId);
          return; // Não enviar se não for um número válido
        }
      } catch (error) {
        console.error('Erro ao converter pageId:', error);
        return; // Não enviar se houver erro
      }
      
      // Limpar e validar dados para evitar problemas com JSON inválido
      const cleanData = {};
      Object.keys(data).forEach(key => {
        // Verificar se o valor é serializável para JSON
        try {
          const value = data[key];
          if (value !== undefined) {
            // Tentar converter para string se for um objeto complexo
            if (typeof value === 'object' && value !== null) {
              try {
                JSON.stringify(value);
                cleanData[key] = value;
              } catch (err) {
                cleanData[key] = String(value);
              }
            } else {
              cleanData[key] = value;
            }
          }
        } catch (error) {
          console.warn(`Valor não serializável para a chave ${key}, será ignorado`, error);
        }
      });
      
      // Criar o objeto de dados completo para enviar
      const trackData = {
        pageId: parsedPageId,
        visitorId: visitorIdRef.current,
        eventType,
        componentId: parsedComponentId,
        data: cleanData,
        device,
        browser,
        os,
        referer: document.referrer,
        timestamp: new Date().toISOString()
      };
      
      // Log para fins de debugging
      console.log(`Enviando evento: ${eventType}`, trackData);
      
      // Enviar dados para o backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData)
      });
      
      // Verificar se houve sucesso
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao enviar evento: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('Resposta do servidor para evento:', responseData);
      
    } catch (error) {
      console.error('Erro ao rastrear evento:', error);
    }
  };
  
  // Adicionar script do Google Analytics se fornecido
  useEffect(() => {
    // Skip if no GA ID is provided
    if (!gaId) {
      console.log('Google Analytics ID não configurado');
      return;
    }

    // Log for debugging purposes
    console.log(`Inicializando Google Analytics com ID: ${gaId}`);

    // Function to load the GA script
    const loadGoogleAnalytics = () => {
      // Create script elements for Google Analytics
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      
      const inlineScript = document.createElement('script');
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', { 
          page_title: document.title,
          page_path: window.location.pathname,
          page_location: window.location.href
        });
      `;
      
      // Add scripts to document
      document.head.appendChild(gtagScript);
      document.head.appendChild(inlineScript);

      // Track page view
      console.log(`Pageview tracked for page ID: ${pageId}`);
      
      return () => {
        // Cleanup scripts on component unmount
        document.head.removeChild(gtagScript);
        document.head.removeChild(inlineScript);
      };
    };

    // Check if GA is already loaded to avoid duplicate loading
    if (!window.ga && !document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
      loadGoogleAnalytics();
    }
  }, [gaId, pageId]);
  
  // Track component views if needed
  useEffect(() => {
    if (!gaId || !pageComponents || !window.gtag) return;

    // Advanced: Track component impressions if needed
    // This is optional but can provide more detailed analytics
    pageComponents.forEach(component => {
      if (component && component.id) {
        console.log(`Component in view: ${component.type} (ID: ${component.id})`);
        // You can add component tracking here if needed
      }
    });
  }, [gaId, pageComponents]);
  
  // Rastrear visualização da página
  useEffect(() => {
    // Só rastrear pageview quando tivermos certeza que pageId é válido
    if (!hasTrackedPageviewRef.current && pageId && parseInt(pageId, 10) > 0) {
      trackEvent('pageview');
      hasTrackedPageviewRef.current = true;
    }
    
    // Rastrear quando o usuário sai da página
    const handleBeforeUnload = () => {
      const timeSpent = (Date.now() - sessionStartRef.current) / 1000;
      trackEvent('exit', null, { timeSpent });
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pageId]);
  
  // Rastrear rolagem da página
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollPercentage = (scrollPosition / (documentHeight - windowHeight)) * 100;
      
      // Verifica se rolou para baixo e passou de um limiar (25%, 50%, 75%, 100%)
      const thresholds = [25, 50, 75, 100];
      const lastScrollPercentage = (lastScrollPositionRef.current / (documentHeight - windowHeight)) * 100;
      
      for (const threshold of thresholds) {
        if (scrollPercentage >= threshold && lastScrollPercentage < threshold) {
          trackEvent('scroll', null, { percentage: threshold });
        }
      }
      
      lastScrollPositionRef.current = scrollPosition;
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pageId]);
  
  // Rastreamento de cliques globais para detectar cliques em componentes
  useEffect(() => {
    try {
      // Verificar se os componentes estão disponíveis e são válidos
      if (!pageComponents || pageComponents.length === 0) {
        console.warn('AnalyticsTracker: Nenhum componente disponível para rastreamento');
        return;
      }
  
      // Verificar se todos os componentes têm IDs válidos
      const componentsMissingIds = pageComponents.filter(c => !c.id || isNaN(parseInt(c.id, 10)));
      if (componentsMissingIds.length > 0) {
        console.warn('AnalyticsTracker: Alguns componentes não têm IDs válidos:', 
          componentsMissingIds.map(c => ({type: c.type, content: c.content})));
      }
      
      // Verificar se pageId é válido
      if (!pageId || isNaN(parseInt(pageId, 10))) {
        console.error('AnalyticsTracker: pageId inválido:', pageId);
        return;
      }
      
      // Função para identificar o componente a partir de um elemento clicado
      const findComponentForElement = (element) => {
        // Primeiro, vamos tentar encontrar um componente pelo seletor característico do wrapper principal
        let target = element;
        let componentWrapper = null;
        let componentType = null;

        // Verificar em qual tipo de componente o elemento está contido
        const rendererTypes = [
          'link-renderer',
          'social-renderer',
          'icon-renderer',
          'text-renderer',
          'banner-renderer',
          'carousel-renderer'
        ];
        
        // Buscar o wrapper de componente mais próximo
        for (const type of rendererTypes) {
          componentWrapper = target.closest(`.${type}`);
          if (componentWrapper) {
            // Extrair o tipo do nome da classe (remover '-renderer')
            componentType = type.replace('-renderer', '');
            break;
          }
        }
        
        // Se não encontramos o componente, retornar null
        if (!componentWrapper || !componentType) {
          console.log('Não foi possível identificar o wrapper do componente para:', element);
          return null;
        }
        
        // Log do wrapper e tipo identificados
        console.log('ComponentWrapper identificado:', {
          elemento: componentWrapper,
          tipo: componentType
        });
        
        // Tentar encontrar o componente com base no tipo
        let matchedComponent = null;
        
        // Procurar componente por tipo
        const componentsOfType = pageComponents.filter(comp => comp.type === componentType);
        
        if (componentsOfType.length === 1) {
          // Se só existe um componente desse tipo, usar ele
          matchedComponent = componentsOfType[0];
        } else if (componentsOfType.length > 1) {
          // Lógica existente para diferenciar múltiplos componentes do mesmo tipo...
          // ...
        }
        
        // Log do componente encontrado
        if (matchedComponent) {
          console.log('Componente identificado:', {
            id: matchedComponent.id,
            tipo: matchedComponent.type,
            titulo: matchedComponent.content.title || 'Sem título'
          });
        } else {
          console.log('Nenhum componente encontrado do tipo:', componentType);
        }
        
        return matchedComponent;
      };
      
      const handleClick = (e) => {
        // Encontrar o elemento clicável
        let target = e.target;
        let elementType = target.tagName.toLowerCase();
        
        // Se o próprio elemento não for clicável, procurar pelo pai mais próximo que seja
        if (!target.tagName.match(/^(A|BUTTON)$/i)) {
          const closestClickable = target.closest('a, button');
          if (closestClickable) {
            target = closestClickable;
            elementType = target.tagName.toLowerCase();
          }
        }
        
        // Encontrar o componente ao qual este elemento pertence
        const component = findComponentForElement(target);
        
        // Debug: registrar informações sobre o clique no console
        console.log('Clique detectado:', {
          elemento: target,
          tipo: elementType,
          componenteIdentificado: component ? {
            id: component.id,
            tipo: component.type,
            titulo: component.content.title
          } : 'Nenhum componente identificado'
        });
        
        if (component) {
          const linkUrl = target.tagName === 'A' ? target.href : 
                        target.querySelector('a')?.href;
          
          // Garantir que usamos um ID válido
          const componentId = component.id;
          
          trackEvent('click', componentId, { 
            componentType: component.type || 'unknown',
            componentTitle: component.content.title || '',
            linkUrl,
            elementType
          });
        } else {
          // Mesmo quando não identificamos o componente específico, 
          // ainda rastreamos o clique como um evento anônimo
          trackEvent('click', null, {
            elementType,
            linkUrl: target.tagName === 'A' ? target.href : target.querySelector('a')?.href,
            elementText: target.textContent?.trim() || '',
            classNames: target.className,
            tagName: target.tagName
          });
        }
      };
      
      document.addEventListener('click', handleClick, true);
      
      return () => {
        document.removeEventListener('click', handleClick, true);
      };
    } catch (error) {
      console.error('Erro ao configurar rastreamento de cliques:', error);
    }
  }, [pageComponents, pageId]);
  
  return null; // Este componente não renderiza nada visualmente
};

export default AnalyticsTracker; 