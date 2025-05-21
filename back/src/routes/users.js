// Endpoint para definir ou atualizar o username
router.put('/api/me/username', requireAuth, async (req, res) => {
  const { username } = req.body;
  const userId = req.user.id;

  if (!username || username.trim() === '') {
    return res.status(400).json({ message: 'Nome de usuário não pode estar vazio' });
  }
  
  // Validar formato
  if (!/^[a-z0-9-_.]+$/i.test(username)) {
    return res.status(400).json({ message: 'Nome de usuário pode conter apenas letras, números, hífens, pontos e underscores' });
  }
  
  try {
    // Verificar se o username já está em uso
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });
    
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ message: 'Este nome de usuário já está em uso' });
    }
    
    // Atualizar o usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username }
    });
    
    return res.json({ 
      message: 'Nome de usuário atualizado com sucesso',
      username: updatedUser.username
    });
  } catch (error) {
    console.error('Erro ao atualizar nome de usuário:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}); 