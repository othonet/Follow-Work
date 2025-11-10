const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Auth
const loginPage = (req, res) => {
  const message = req.query.message;
  res.render('admin/login', { message });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.render('admin/login', { error: 'Email ou senha inválidos' });
    }

    if (user.role !== 'admin') {
      return res.render('admin/login', { error: 'Acesso negado. Apenas administradores podem acessar esta área.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.render('admin/login', { error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect('/admin/projects');
  } catch (error) {
    console.error('Erro no login:', error);
    res.render('admin/login', { error: 'Erro ao fazer login' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin/login');
};

// Projects
const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        stages: {
          include: {
            activities: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.render('admin/projects', { projects });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).render('error', { message: 'Erro ao carregar projetos' });
  }
};

const createProjectPage = (req, res) => {
  res.render('admin/project-form', { project: null });
};

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    await prisma.project.create({
      data: {
        name,
        description: description || null
      }
    });

    res.redirect('/admin/projects');
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.render('admin/project-form', {
      project: null,
      error: 'Erro ao criar projeto'
    });
  }
};

const editProjectPage = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project) {
      return res.status(404).render('error', { message: 'Projeto não encontrado' });
    }

    res.render('admin/project-form', { project });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).render('error', { message: 'Erro ao carregar projeto' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || null
      }
    });

    res.redirect('/admin/projects');
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    res.render('admin/project-form', {
      project: { id, name, description },
      error: 'Erro ao atualizar projeto'
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id: parseInt(id) }
    });

    res.redirect('/admin/projects');
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    res.status(500).json({ error: 'Erro ao deletar projeto' });
  }
};

// Stages
const getStages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        stages: {
          include: {
            activities: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!project) {
      return res.status(404).render('error', { message: 'Projeto não encontrado' });
    }

    res.render('admin/stages', { project });
  } catch (error) {
    console.error('Erro ao buscar etapas:', error);
    res.status(500).render('error', { message: 'Erro ao carregar etapas' });
  }
};

const createStagePage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) }
    });

    if (!project) {
      return res.status(404).render('error', { message: 'Projeto não encontrado' });
    }

    res.render('admin/stage-form', { project, stage: null });
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    res.status(500).render('error', { message: 'Erro ao carregar projeto' });
  }
};

const createStage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, deadline } = req.body;

    await prisma.stage.create({
      data: {
        name,
        description: description || null,
        deadline: new Date(deadline),
        projectId: parseInt(projectId)
      }
    });

    res.redirect(`/admin/projects/${projectId}/stages`);
  } catch (error) {
    console.error('Erro ao criar etapa:', error);
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) }
    });
    res.render('admin/stage-form', {
      project,
      stage: null,
      error: 'Erro ao criar etapa'
    });
  }
};

const editStagePage = async (req, res) => {
  try {
    const { projectId, id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) }
    });
    const stage = await prisma.stage.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project || !stage) {
      return res.status(404).render('error', { message: 'Projeto ou etapa não encontrado' });
    }

    res.render('admin/stage-form', { project, stage });
  } catch (error) {
    console.error('Erro ao buscar etapa:', error);
    res.status(500).render('error', { message: 'Erro ao carregar etapa' });
  }
};

const updateStage = async (req, res) => {
  try {
    const { projectId, id } = req.params;
    const { name, description, deadline } = req.body;

    await prisma.stage.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || null,
        deadline: new Date(deadline)
      }
    });

    res.redirect(`/admin/projects/${projectId}/stages`);
  } catch (error) {
    console.error('Erro ao atualizar etapa:', error);
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) }
    });
    res.render('admin/stage-form', {
      project,
      stage: { id, name, description, deadline },
      error: 'Erro ao atualizar etapa'
    });
  }
};

const deleteStage = async (req, res) => {
  try {
    const { projectId, id } = req.params;

    await prisma.stage.delete({
      where: { id: parseInt(id) }
    });

    res.redirect(`/admin/projects/${projectId}/stages`);
  } catch (error) {
    console.error('Erro ao deletar etapa:', error);
    res.status(500).json({ error: 'Erro ao deletar etapa' });
  }
};

// Activities
const getActivities = async (req, res) => {
  try {
    const { projectId, stageId } = req.params;
    const stage = await prisma.stage.findUnique({
      where: { id: parseInt(stageId) },
      include: {
        project: true,
        activities: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (!stage) {
      return res.status(404).render('error', { message: 'Etapa não encontrada' });
    }

    res.render('admin/activities', { stage, projectId });
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    res.status(500).render('error', { message: 'Erro ao carregar atividades' });
  }
};

const createActivityPage = async (req, res) => {
  try {
    const { projectId, stageId } = req.params;
    const stage = await prisma.stage.findUnique({
      where: { id: parseInt(stageId) },
      include: {
        project: true
      }
    });

    if (!stage) {
      return res.status(404).render('error', { message: 'Etapa não encontrada' });
    }

    res.render('admin/activity-form', { stage, projectId, activity: null });
  } catch (error) {
    console.error('Erro ao buscar etapa:', error);
    res.status(500).render('error', { message: 'Erro ao carregar etapa' });
  }
};

const createActivity = async (req, res) => {
  try {
    const { projectId, stageId } = req.params;
    const { name, description } = req.body;

    await prisma.activity.create({
      data: {
        name,
        description: description || null,
        stageId: parseInt(stageId)
      }
    });

    res.redirect(`/admin/projects/${projectId}/stages/${stageId}/activities`);
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    const stage = await prisma.stage.findUnique({
      where: { id: parseInt(stageId) },
      include: { project: true }
    });
    res.render('admin/activity-form', {
      stage,
      projectId,
      activity: null,
      error: 'Erro ao criar atividade'
    });
  }
};

const editActivityPage = async (req, res) => {
  try {
    const { projectId, stageId, id } = req.params;
    const stage = await prisma.stage.findUnique({
      where: { id: parseInt(stageId) },
      include: {
        project: true
      }
    });
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) }
    });

    if (!stage || !activity) {
      return res.status(404).render('error', { message: 'Etapa ou atividade não encontrada' });
    }

    res.render('admin/activity-form', { stage, projectId, activity });
  } catch (error) {
    console.error('Erro ao buscar atividade:', error);
    res.status(500).render('error', { message: 'Erro ao carregar atividade' });
  }
};

const updateActivity = async (req, res) => {
  try {
    const { projectId, stageId, id } = req.params;
    const { name, description, completed } = req.body;

    await prisma.activity.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || null,
        completed: completed === 'on' || completed === true
      }
    });

    res.redirect(`/admin/projects/${projectId}/stages/${stageId}/activities`);
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    const stage = await prisma.stage.findUnique({
      where: { id: parseInt(stageId) },
      include: { project: true }
    });
    res.render('admin/activity-form', {
      stage,
      projectId,
      activity: { id, name, description, completed },
      error: 'Erro ao atualizar atividade'
    });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const { projectId, stageId, id } = req.params;

    await prisma.activity.delete({
      where: { id: parseInt(id) }
    });

    res.redirect(`/admin/projects/${projectId}/stages/${stageId}/activities`);
  } catch (error) {
    console.error('Erro ao deletar atividade:', error);
    res.status(500).json({ error: 'Erro ao deletar atividade' });
  }
};

const toggleActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }

    const updated = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: {
        completed: !activity.completed
      }
    });

    res.json({ completed: updated.completed });
  } catch (error) {
    console.error('Erro ao alternar atividade:', error);
    res.status(500).json({ error: 'Erro ao alternar atividade' });
  }
};

// Clients Management
const getClients = async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'cliente' },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    res.render('admin/clients', { clients });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).render('error', { message: 'Erro ao carregar clientes' });
  }
};

const createClientPage = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' }
    });
    res.render('admin/client-form', { client: null, projects });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).render('error', { message: 'Erro ao carregar projetos' });
  }
};

const createClient = async (req, res) => {
  try {
    const { name, email, password, projects } = req.body;

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      const allProjects = await prisma.project.findMany({
        orderBy: { name: 'asc' }
      });
      return res.render('admin/client-form', {
        client: null,
        projects: allProjects,
        error: 'Email já cadastrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Converter projects para array se for string única
    const projectIds = projects 
      ? (Array.isArray(projects) ? projects : [projects]).map(id => parseInt(id)).filter(id => !isNaN(id))
      : [];

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'cliente',
        projects: {
          create: projectIds.map(projectId => ({
            projectId
          }))
        }
      }
    });

    res.redirect('/admin/clients');
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    const allProjects = await prisma.project.findMany({
      orderBy: { name: 'asc' }
    });
    res.render('admin/client-form', {
      client: null,
      projects: allProjects,
      error: 'Erro ao criar cliente'
    });
  }
};

const editClientPage = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        projects: {
          select: {
            projectId: true
          }
        }
      }
    });

    if (!client || client.role !== 'cliente') {
      return res.status(404).render('error', { message: 'Cliente não encontrado' });
    }

    const projects = await prisma.project.findMany({
      orderBy: { name: 'asc' }
    });

    // Adicionar flag para indicar quais projetos o cliente tem acesso
    const projectsWithAccess = projects.map(project => ({
      ...project,
      hasAccess: client.projects.some(up => up.projectId === project.id)
    }));

    res.render('admin/client-form', { 
      client: {
        ...client,
        projectIds: client.projects.map(up => up.projectId)
      },
      projects: projectsWithAccess
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).render('error', { message: 'Erro ao carregar cliente' });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, projects } = req.body;

    // Verificar se o email já existe em outro usuário
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: parseInt(id) }
      }
    });

    if (existingUser) {
      const client = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: { id: true, name: true, email: true }
      });
      const allProjects = await prisma.project.findMany({
        orderBy: { name: 'asc' }
      });
      return res.render('admin/client-form', {
        client,
        projects: allProjects,
        error: 'Email já cadastrado para outro usuário'
      });
    }

    const updateData = {
      name,
      email
    };

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // Atualizar projetos do cliente
    const projectIds = projects 
      ? (Array.isArray(projects) ? projects : [projects]).map(id => parseInt(id)).filter(id => !isNaN(id))
      : [];

    // Remover todas as relações existentes
    await prisma.userProject.deleteMany({
      where: { userId: parseInt(id) }
    });

    // Criar novas relações
    if (projectIds.length > 0) {
      await prisma.userProject.createMany({
        data: projectIds.map(projectId => ({
          userId: parseInt(id),
          projectId
        }))
      });
    }

    res.redirect('/admin/clients');
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    const client = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { id: true, name: true, email: true }
    });
    const allProjects = await prisma.project.findMany({
      orderBy: { name: 'asc' }
    });
    res.render('admin/client-form', {
      client,
      projects: allProjects,
      error: 'Erro ao atualizar cliente'
    });
  }
};

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se é um cliente antes de deletar
    const client = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!client || client.role !== 'cliente') {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.redirect('/admin/clients');
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
};

// Admins Management
const getAdmins = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.render('admin/admins', { admins, currentUserId: req.user.id });
  } catch (error) {
    console.error('Erro ao buscar administradores:', error);
    res.status(500).render('error', { message: 'Erro ao carregar administradores' });
  }
};

const createAdminPage = (req, res) => {
  res.render('admin/admin-form', { admin: null });
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.render('admin/admin-form', {
        admin: null,
        error: 'Email já cadastrado'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'admin'
      }
    });

    res.redirect('/admin/admins');
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    res.render('admin/admin-form', {
      admin: null,
      error: 'Erro ao criar administrador'
    });
  }
};

const editAdminPage = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await prisma.user.findUnique({
      where: { id: parseInt(id), role: 'admin' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!admin) {
      return res.status(404).render('error', { message: 'Administrador não encontrado' });
    }

    res.render('admin/admin-form', { admin, currentUserId: req.user.id });
  } catch (error) {
    console.error('Erro ao buscar administrador:', error);
    res.status(500).render('error', { message: 'Erro ao carregar administrador' });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const currentUserId = req.user.id;
    const isUpdatingSelf = parseInt(id) === currentUserId;

    // Verificar se o email já existe em outro usuário
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: parseInt(id) }
      }
    });

    if (existingUser) {
      const admin = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: { id: true, name: true, email: true }
      });
      return res.render('admin/admin-form', {
        admin,
        currentUserId,
        error: 'Email já cadastrado para outro usuário'
      });
    }

    const updateData = {
      name,
      email
    };

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    // Se o usuário atualizou a si mesmo, fazer logout
    if (isUpdatingSelf) {
      res.clearCookie('token');
      return res.redirect('/admin/login?message=Seus dados foram atualizados. Por favor, faça login novamente.');
    }

    res.redirect('/admin/admins');
  } catch (error) {
    console.error('Erro ao atualizar administrador:', error);
    const admin = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: { id: true, name: true, email: true }
    });
    res.render('admin/admin-form', {
      admin,
      currentUserId: req.user.id,
      error: 'Erro ao atualizar administrador'
    });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    // Verificar se está tentando deletar a si mesmo
    if (parseInt(id) === currentUserId) {
      return res.status(403).render('error', { 
        message: 'Você não pode deletar sua própria conta enquanto estiver logado.' 
      });
    }

    // Verificar se é um admin antes de deletar
    const admin = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ error: 'Administrador não encontrado' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.redirect('/admin/admins');
  } catch (error) {
    console.error('Erro ao deletar administrador:', error);
    res.status(500).json({ error: 'Erro ao deletar administrador' });
  }
};

module.exports = {
  loginPage,
  login,
  logout,
  getProjects,
  createProjectPage,
  createProject,
  editProjectPage,
  updateProject,
  deleteProject,
  getStages,
  createStagePage,
  createStage,
  editStagePage,
  updateStage,
  deleteStage,
  getActivities,
  createActivityPage,
  createActivity,
  editActivityPage,
  updateActivity,
  deleteActivity,
  toggleActivity,
  getClients,
  createClientPage,
  createClient,
  editClientPage,
  updateClient,
  deleteClient,
  getAdmins,
  createAdminPage,
  createAdmin,
  editAdminPage,
  updateAdmin,
  deleteAdmin
};

