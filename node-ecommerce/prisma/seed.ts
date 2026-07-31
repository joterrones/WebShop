import {
  AdjustmentType,
  AttributeDataType,
  DocumentType,
  OrderStatus,
  PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

/** Rutas relativas servidas por Express en /images/products/... */
const productImage = (slug: string, variant: 1 | 2) =>
  `/images/products/${slug}-${variant}.svg`;

async function wipeDatabase(): Promise<void> {
  await prisma.orderPriceAdjustment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItemAttribute.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productAttributeValue.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.attributeOption.deleteMany();
  await prisma.attributeDefinition.deleteMany();
  await prisma.category.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.storeSetting.deleteMany();
  await prisma.user.deleteMany();
}

async function ensureAdminUser(
  username: string,
  password: string,
): Promise<void> {
  const bcrypt = await import('bcryptjs');
  const normalized = username.toLowerCase();
  const passwordHash = await bcrypt.default.hash(password, 10);
  await prisma.user.upsert({
    where: { username: normalized },
    create: {
      username: normalized,
      passwordHash,
      role: 'admin',
    },
    update: {
      passwordHash,
      role: 'admin',
    },
  });
  console.log(`Usuario admin listo: usuario=${normalized} clave=${password}`);
}

async function ensureAdminUsers(): Promise<void> {
  await ensureAdminUser('admin', 'admin123');
  await ensureAdminUser('administrador', 'daniel');
}

async function main() {
  const forceReset =
    process.env.FORCE_SEED_RESET === '1' ||
    process.argv.includes('--force-reset');

  const existingCategories = await prisma.category.count();

  if (!forceReset && existingCategories > 0) {
    await ensureAdminUsers();
    console.log(
      'Seed omitido: la base ya tiene datos. Usa `npm run db:seed:reset` solo si quieres borrar y volver a cargar el demo.',
    );
    return;
  }

  if (forceReset) {
    console.log('FORCE_SEED_RESET activo: borrando datos existentes...');
    await wipeDatabase();
  } else {
    console.log('Seeding database (BD vacía)...');
  }

  await ensureAdminUsers();

  const categories = await Promise.all([
    prisma.category.create({
      data: { name: 'Fútbol', slug: 'futbol', sortOrder: 1 },
    }),
    prisma.category.create({
      data: { name: 'Running', slug: 'running', sortOrder: 2 },
    }),
    prisma.category.create({
      data: { name: 'Gym & Fitness', slug: 'gym-fitness', sortOrder: 3 },
    }),
    prisma.category.create({
      data: { name: 'Natación', slug: 'natacion', sortOrder: 4 },
    }),
    prisma.category.create({
      data: { name: 'Outdoor', slug: 'outdoor', sortOrder: 5 },
    }),
    prisma.category.create({
      data: { name: 'Ropa Deportiva', slug: 'ropa-deportiva', sortOrder: 6 },
    }),
    prisma.category.create({
      data: { name: 'Calzado', slug: 'calzado', sortOrder: 7 },
    }),
  ]);

  const [futbol, running, gym, natacion, outdoor, ropa, calzado] = categories;

  const attrTalla = await prisma.attributeDefinition.create({
    data: {
      code: 'talla',
      name: 'Talla',
      dataType: AttributeDataType.select,
      isRequired: true,
      sortOrder: 1,
      options: {
        create: [
          { value: '8', sortOrder: 1 },
          { value: '10', sortOrder: 2 },
          { value: '12', sortOrder: 3 },
          { value: 'XS', sortOrder: 4 },
          { value: 'S', sortOrder: 5 },
          { value: 'M', sortOrder: 6 },
          { value: 'L', sortOrder: 7 },
          { value: 'XL', sortOrder: 8 },
        ],
      },
    },
    include: { options: true },
  });

  const attrTela = await prisma.attributeDefinition.create({
    data: {
      code: 'tipo_tela',
      name: 'Tipo de tela',
      dataType: AttributeDataType.select,
      isRequired: true,
      sortOrder: 2,
      options: {
        create: [
          { value: 'Dry-Fit', sortOrder: 1 },
          { value: 'Algodón', sortOrder: 2 },
          { value: 'Poliéster', sortOrder: 3 },
          { value: 'Spandex', sortOrder: 4 },
        ],
      },
    },
    include: { options: true },
  });

  const attrColor = await prisma.attributeDefinition.create({
    data: {
      code: 'color',
      name: 'Color',
      dataType: AttributeDataType.select,
      isRequired: false,
      sortOrder: 3,
      options: {
        create: [
          { value: 'Negro', sortOrder: 1 },
          { value: 'Blanco', sortOrder: 2 },
          { value: 'Azul', sortOrder: 3 },
          { value: 'Rojo', sortOrder: 4 },
        ],
      },
    },
    include: { options: true },
  });

  const attrMarca = await prisma.attributeDefinition.create({
    data: {
      code: 'marca',
      name: 'Marca',
      dataType: AttributeDataType.text,
      isRequired: false,
      sortOrder: 4,
    },
  });

  const tallaM = attrTalla.options.find((o) => o.value === 'M')!;
  const tallaL = attrTalla.options.find((o) => o.value === 'L')!;
  const telaDry = attrTela.options.find((o) => o.value === 'Dry-Fit')!;
  const telaAlgodon = attrTela.options.find((o) => o.value === 'Algodón')!;
  const colorNegro = attrColor.options.find((o) => o.value === 'Negro')!;
  const colorAzul = attrColor.options.find((o) => o.value === 'Azul')!;

  const productsData = [
    {
      categoryId: futbol.id,
      name: 'Camiseta Fútbol Pro',
      slug: 'camiseta-futbol-pro',
      description: 'Camiseta oficial de entrenamiento con tecnología Dry-Fit.',
      basePrice: 89.9,
      previousPrice: 99.9,
      stockQuantity: 50,
      showInBanner: true,
      reviews: 48,
      ratingRate: 4.5,
      attrs: [
        { defId: attrTalla.id, optId: tallaM.id },
        { defId: attrTela.id, optId: telaDry.id },
        { defId: attrColor.id, optId: colorAzul.id },
        { defId: attrMarca.id, text: 'Nike' },
      ],
    },
    {
      categoryId: running.id,
      name: 'Camiseta Running Pro',
      slug: 'camiseta-running-pro',
      description: 'Camiseta ligera para carreras de larga distancia.',
      basePrice: 79.9,
      previousPrice: 89.9,
      stockQuantity: 40,
      showInBanner: true,
      reviews: 32,
      ratingRate: 4.2,
      attrs: [
        { defId: attrTalla.id, optId: tallaM.id },
        { defId: attrTela.id, optId: telaDry.id },
        { defId: attrColor.id, optId: colorNegro.id },
        { defId: attrMarca.id, text: 'Adidas' },
      ],
    },
    {
      categoryId: gym.id,
      name: 'Top Deportivo Gym',
      slug: 'top-deportivo-gym',
      description: 'Top de compresión ideal para entrenamiento funcional.',
      basePrice: 59.9,
      previousPrice: null,
      stockQuantity: 30,
      attrs: [
        { defId: attrTalla.id, optId: tallaM.id },
        { defId: attrTela.id, optId: telaAlgodon.id },
        { defId: attrColor.id, optId: colorNegro.id },
        { defId: attrMarca.id, text: 'Under Armour' },
      ],
    },
    {
      categoryId: natacion.id,
      name: 'Traje de Baño Competición',
      slug: 'traje-bano-competicion',
      description: 'Traje de baño de competición con reducción de fricción.',
      basePrice: 129.9,
      previousPrice: 149.9,
      stockQuantity: 20,
      attrs: [
        { defId: attrTalla.id, optId: tallaL.id },
        { defId: attrTela.id, optId: telaDry.id },
        { defId: attrColor.id, optId: colorAzul.id },
        { defId: attrMarca.id, text: 'Speedo' },
      ],
    },
    {
      categoryId: outdoor.id,
      name: 'Chaqueta Outdoor Impermeable',
      slug: 'chaqueta-outdoor-impermeable',
      description: 'Chaqueta resistente al agua para trekking y camping.',
      basePrice: 199.9,
      previousPrice: 229.9,
      stockQuantity: 15,
      attrs: [
        { defId: attrTalla.id, optId: tallaL.id },
        { defId: attrTela.id, optId: telaDry.id },
        { defId: attrColor.id, optId: colorNegro.id },
        { defId: attrMarca.id, text: 'Columbia' },
      ],
    },
    {
      categoryId: ropa.id,
      name: 'Pantalón Deportivo Jogger',
      slug: 'pantalon-deportivo-jogger',
      description: 'Pantalón jogger cómodo para uso diario y entrenamiento.',
      basePrice: 69.9,
      previousPrice: null,
      stockQuantity: 60,
      attrs: [
        { defId: attrTalla.id, optId: tallaM.id },
        { defId: attrTela.id, optId: telaAlgodon.id },
        { defId: attrColor.id, optId: colorNegro.id },
        { defId: attrMarca.id, text: 'Puma' },
      ],
    },
    {
      categoryId: calzado.id,
      name: 'Zapatillas Running Elite',
      slug: 'zapatillas-running-elite',
      description: 'Zapatillas con amortiguación avanzada para corredores.',
      basePrice: 249.9,
      previousPrice: 279.9,
      stockQuantity: 25,
      attrs: [
        { defId: attrTalla.id, optId: tallaL.id },
        { defId: attrTela.id, optId: telaDry.id },
        { defId: attrColor.id, optId: colorAzul.id },
        { defId: attrMarca.id, text: 'Asics' },
      ],
    },
    {
      categoryId: futbol.id,
      name: 'Short Fútbol Profesional',
      slug: 'short-futbol-profesional',
      description: 'Short ligero con malla interior para máximo confort.',
      basePrice: 49.9,
      previousPrice: 59.9,
      stockQuantity: 45,
      attrs: [
        { defId: attrTalla.id, optId: tallaM.id },
        { defId: attrTela.id, optId: telaDry.id },
        { defId: attrColor.id, optId: colorAzul.id },
        { defId: attrMarca.id, text: 'Nike' },
      ],
    },
    {
      categoryId: gym.id,
      name: 'Guantes de Gym',
      slug: 'guantes-gym',
      description: 'Guantes con agarre antideslizante para levantamiento.',
      basePrice: 39.9,
      previousPrice: null,
      stockQuantity: 80,
      attrs: [
        { defId: attrTalla.id, optId: tallaM.id },
        { defId: attrTela.id, optId: telaAlgodon.id },
        { defId: attrColor.id, optId: colorNegro.id },
        { defId: attrMarca.id, text: 'Reebok' },
      ],
    },
    {
      categoryId: running.id,
      name: 'Short Running Reflectivo',
      slug: 'short-running-reflectivo',
      description: 'Short con paneles reflectivos para correr de noche.',
      basePrice: 54.9,
      previousPrice: 64.9,
      stockQuantity: 35,
      attrs: [
        { defId: attrTalla.id, optId: tallaL.id },
        { defId: attrTela.id, optId: telaDry.id },
        { defId: attrColor.id, optId: colorNegro.id },
        { defId: attrMarca.id, text: 'New Balance' },
      ],
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        categoryId: p.categoryId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        basePrice: p.basePrice,
        previousPrice: p.previousPrice,
        stockQuantity: p.stockQuantity,
        showInBanner: 'showInBanner' in p ? Boolean(p.showInBanner) : false,
        reviews: 'reviews' in p ? Number(p.reviews) : 0,
        ratingRate: 'ratingRate' in p ? Number(p.ratingRate) : 5,
        images: {
          create: [
            {
              url: productImage(p.slug, 1),
              altText: p.name,
              sortOrder: 0,
              isPrimary: true,
            },
            {
              url: productImage(p.slug, 2),
              altText: `${p.name} vista 2`,
              sortOrder: 1,
              isPrimary: false,
            },
          ],
        },
        attributeValues: {
          create: p.attrs.map((a) => ({
            attributeDefinitionId: a.defId,
            attributeOptionId: a.optId ?? null,
            valueText: a.text ?? null,
          })),
        },
      },
    });
    createdProducts.push(product);
  }

  const [prod1, prod2, prod3] = createdProducts;

  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'PED-2026-00001',
      status: OrderStatus.pendiente,
      clientName: 'Juan Pérez García',
      phoneNumber: '+51 987 654 321',
      province: 'Lima',
      country: 'Perú',
      shippingAddress: 'Av. Javier Prado 1234, San Isidro',
      documentType: DocumentType.DNI,
      documentNumber: '45678901',
      subtotal: 169.8,
      discountTotal: 0,
      shippingCost: 15,
      total: 184.8,
      notes: 'Entregar en horario de oficina',
      items: {
        create: [
          {
            productId: prod1.id,
            productName: 'Camiseta Fútbol Pro',
            description: 'Camiseta oficial de entrenamiento con tecnología Dry-Fit.',
            talla: 'M',
            tipoTela: 'Dry-Fit',
            quantity: 1,
            unitPrice: 89.9,
            lineDiscount: 0,
            lineTotal: 89.9,
            attributes: {
              create: [
                { attributeCode: 'color', attributeName: 'Color', value: 'Azul' },
                { attributeCode: 'marca', attributeName: 'Marca', value: 'Nike' },
              ],
            },
          },
          {
            productId: prod2.id,
            productName: 'Camiseta Running Pro',
            description: 'Camiseta ligera para carreras de larga distancia.',
            talla: 'M',
            tipoTela: 'Dry-Fit',
            quantity: 1,
            unitPrice: 79.9,
            lineDiscount: 0,
            lineTotal: 79.9,
            attributes: {
              create: [
                { attributeCode: 'color', attributeName: 'Color', value: 'Negro' },
                { attributeCode: 'marca', attributeName: 'Marca', value: 'Adidas' },
              ],
            },
          },
        ],
      },
      statusHistory: {
        create: [
          {
            fromStatus: null,
            toStatus: OrderStatus.pendiente,
            reason: 'Pedido creado',
          },
        ],
      },
    },
    include: { items: true },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'PED-2026-00002',
      status: OrderStatus.en_proceso,
      clientName: 'Deportes Andinos S.A.C.',
      phoneNumber: '+51 01 456 7890',
      province: 'Arequipa',
      country: 'Perú',
      shippingAddress: 'Calle Mercaderes 567, Cercado',
      documentType: DocumentType.RUC,
      documentNumber: '20123456789',
      subtotal: 249.9,
      discountTotal: 24.99,
      shippingCost: 20,
      total: 244.91,
      items: {
        create: [
          {
            productId: prod3.id,
            productName: 'Top Deportivo Gym',
            description: 'Top de compresión ideal para entrenamiento funcional.',
            talla: 'M',
            tipoTela: 'Algodón',
            quantity: 3,
            unitPrice: 59.9,
            lineDiscount: 0,
            lineTotal: 179.7,
            attributes: {
              create: [
                { attributeCode: 'color', attributeName: 'Color', value: 'Negro' },
                { attributeCode: 'marca', attributeName: 'Marca', value: 'Under Armour' },
              ],
            },
          },
        ],
      },
      statusHistory: {
        create: [
          {
            fromStatus: null,
            toStatus: OrderStatus.pendiente,
            reason: 'Pedido creado',
          },
          {
            fromStatus: OrderStatus.pendiente,
            toStatus: OrderStatus.en_proceso,
            reason: 'Pedido en atención',
          },
        ],
      },
      adjustments: {
        create: [
          {
            adjustmentType: AdjustmentType.discount_percent,
            value: 10,
            reason: 'Descuento por compra mayorista',
          },
        ],
      },
    },
    include: { items: true },
  });

  const order3 = await prisma.order.create({
    data: {
      orderNumber: 'PED-2026-00003',
      status: OrderStatus.atendido,
      clientName: 'María López Torres',
      phoneNumber: '+51 912 345 678',
      province: 'Cusco',
      country: 'Perú',
      shippingAddress: 'Jr. El Sol 890, Wanchaq',
      documentType: DocumentType.DNI,
      documentNumber: '72345678',
      subtotal: 249.9,
      discountTotal: 0,
      shippingCost: 25,
      total: 274.9,
      items: {
        create: [
          {
            productName: 'Zapatillas Running Elite',
            description: 'Zapatillas con amortiguación avanzada para corredores.',
            talla: 'L',
            tipoTela: 'Dry-Fit',
            quantity: 1,
            unitPrice: 249.9,
            lineDiscount: 0,
            lineTotal: 249.9,
            attributes: {
              create: [
                { attributeCode: 'marca', attributeName: 'Marca', value: 'Asics' },
              ],
            },
          },
        ],
      },
      statusHistory: {
        create: [
          {
            fromStatus: null,
            toStatus: OrderStatus.pendiente,
            reason: 'Pedido creado',
          },
          {
            fromStatus: OrderStatus.pendiente,
            toStatus: OrderStatus.en_proceso,
            reason: 'En proceso de preparación',
          },
          {
            fromStatus: OrderStatus.en_proceso,
            toStatus: OrderStatus.atendido,
            reason: 'Pedido entregado al cliente',
          },
        ],
      },
    },
  });

  void order1;
  void order2;
  void order3;

  await prisma.storeSetting.create({
    data: {
      key: 'whatsapp_number',
      value: '51999888777',
    },
  });

  console.log(`Seeded ${categories.length} categories`);
  console.log(`Seeded ${createdProducts.length} products`);
  console.log('Seeded 3 sample orders with status history');
  console.log('Seeded WhatsApp number: 51999888777');
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
