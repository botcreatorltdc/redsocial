# Documento de Producto y Arquitectura: App Cannábica (Red Social & Directorio)

## 1. Visión General del Producto
Plataforma integral (App móvil nativa iOS/Android + Web App) enfocada en la comunidad cannábica. Funciona como un directorio interactivo (estilo Weedmaps) y una red social comunitaria. El enfoque de diseño y comunicación es "Clínico/Wellness", priorizando la salud, la educación, la seguridad y la privacidad.

## 2. Stack Tecnológico Recomendado
Para asegurar compatibilidad, compartir código y lanzar un MVP (Producto Mínimo Viable) robusto:
* Frontend Móvil (iOS/Android): React Native (con Expo para agilizar el despliegue).
* Frontend Web (B2C y Portal B2B): Next.js (React) por su excelente SEO y rendimiento.
* Backend & Base de Datos: Supabase (PostgreSQL + Auth + Storage). Permite un desarrollo muy rápido, maneja relaciones complejas y tiene autenticación integrada.
* Mapas e Interfaz de Geodata: Mapbox API (permite customizar el mapa con colores relajantes/muted).

## 3. Guía de Diseño (UX/UI) - Estilo "Wellness & Botánico"
* Colores: Regla 60/30/10. 60% Blancos/Cremas (Off-white), 30% Verde Salvia/Eucalipto, 10% Acento (Terracota suave o Verde Pino para botones).
* Tipografía: Redondeada para títulos (Poppins/Nunito), neutra para cuerpo de texto (Inter/Roboto).
* Formas: Bordes redondeados en todas las tarjetas y botones (12px - 16px).
* Tono de voz: Educativo, respetuoso, clínico (ej. "Variedades premium", "Alivio físico", "Espacio de degustación").

## 4. Flujos Críticos de la Aplicación (Móvil)
1. Onboarding & Age Gate: Pantalla obligatoria de +18/+21. Carrusel de valor. Registro rápido (Apple/Google) pidiendo un Nickname (privacidad). Selección de preferencias (efectos y formatos).
2. Feed Social (Home): Saludo personalizado. Carrusel horizontal de recomendaciones basadas en preferencias. Muro vertical con check-ins, reseñas y fotos de usuarios seguidos. Botón flotante para acciones rápidas.
3. Mapa Interactivo: Pines limpios (Verde Salvia) y pines con "Check" para clubes verificados. Al tocar un pin, se abre un Bottom Sheet (Media tarjeta) con info rápida (estado, distancia, valoración).
4. Perfil del Club: Galería hero, estado abierto/cerrado, requisitos de acceso claros (DNI, edad, cuota), y navegación por pestañas (Menú, Servicios, Reseñas).
5. Catálogo de Variedades (Biblioteca Botánica): Búsqueda por efectos (Dormir, Creatividad, Energía). Ficha con barras de cannabinoides, gráfico de terpenos, efectos reportados y un bloque dinámico de "Disponible en 3 clubes cerca de ti".

## 5. Panel de Administración Web (B2B Portal)
* Embudo de Verificación: Flujo para reclamar o crear un club con subida de documentos.
* Dashboard: Métricas de visualizaciones, rutas generadas y puntuación.
* Gestión de Inventario Dinámico: Conexión con la "Biblioteca Botánica" global para añadir productos al menú con un solo clic (Toggle Disponible/Agotado).
* Edición de Perfil y Reseñas: Actualización de horarios/fotos y bandeja de entrada para responder a clientes.

## 6. Esquema de la Base de Datos (Relacional - PostgreSQL)
Entidades principales y sus atributos clave:
* Users: id, email, nickname, avatar_url, birth_date, is_verified, preferences_json, created_at.
* Clubs: id, name, description, lat, lng, address, cover_image, is_verified, requirements_json, amenities_json, owner_id.
* Products (Catálogo Global): id, name, category (flower, extract, etc.), strain_type, lineage, thc_avg, cbd_avg, terpenes_json, effects_json.
* Club_Inventory (Tabla pivote): club_id, product_id, is_available, updated_at.
* Reviews: id, author_id, target_type (club/product), target_id, rating, content_text, images_array, created_at.
* Social_Feed (Actividad): id, user_id, action_type (check-in, review), target_id, created_at.
* Followers: follower_id, following_id, created_at.