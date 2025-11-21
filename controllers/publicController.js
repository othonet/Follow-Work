const prisma = require('../config/database');

const getProjects = async (req, res) => {
  try {
    const user = req.user; // Usuário autenticado do middleware

    // Se for admin, mostra todos os projetos
    // Se for cliente, mostra apenas os projetos que ele tem acesso
    let whereClause = {};
    
    if (user.role === 'cliente') {
      // Buscar IDs dos projetos que o cliente tem acesso
      const userProjects = await prisma.userProject.findMany({
        where: { userId: user.id },
        select: { projectId: true }
      });
      
      const projectIds = userProjects.map(up => up.projectId);
      
      if (projectIds.length === 0) {
        // Cliente sem projetos, retornar lista vazia
        return res.render('public/projects', { projects: [] });
      }
      
      whereClause = { id: { in: projectIds } };
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        stages: {
          include: {
            activities: true,
            _count: {
              select: { activities: true }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular progresso para cada etapa
    const projectsWithProgress = projects.map(project => {
      const stagesWithProgress = project.stages.map(stage => {
        const totalActivities = stage.activities.length;
        const completedActivities = stage.activities.filter(a => a.completed).length;
        const progress = totalActivities > 0 
          ? Math.round((completedActivities / totalActivities) * 100) 
          : 0;

        return {
          ...stage,
          progress,
          totalActivities,
          completedActivities
        };
      });

      // Calcular progresso geral do projeto
      const allActivities = stagesWithProgress.flatMap(s => s.activities);
      const totalProjectActivities = allActivities.length;
      const completedProjectActivities = allActivities.filter(a => a.completed).length;
      const projectProgress = totalProjectActivities > 0
        ? Math.round((completedProjectActivities / totalProjectActivities) * 100)
        : 0;

      return {
        ...project,
        stages: stagesWithProgress,
        progress: projectProgress
      };
    });

    res.render('public/projects', { projects: projectsWithProgress });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).render('error', { message: 'Erro ao carregar projetos' });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user; // Usuário autenticado do middleware

    // Verificar se o cliente tem acesso a este projeto
    if (user.role === 'cliente') {
      const hasAccess = await prisma.userProject.findFirst({
        where: {
          userId: user.id,
          projectId: parseInt(id)
        }
      });

      if (!hasAccess) {
        return res.status(403).render('error', { message: 'Você não tem permissão para acessar este projeto' });
      }
    }

    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        stages: {
          include: {
            activities: {
              orderBy: {
                order: 'asc'
              }
            }
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

    // Calcular progresso para cada etapa
    const stagesWithProgress = project.stages.map(stage => {
      const totalActivities = stage.activities.length;
      const completedActivities = stage.activities.filter(a => a.completed).length;
      const progress = totalActivities > 0 
        ? Math.round((completedActivities / totalActivities) * 100) 
        : 0;

      return {
        ...stage,
        progress,
        totalActivities,
        completedActivities
      };
    });

    // Calcular progresso geral do projeto
    const allActivities = stagesWithProgress.flatMap(s => s.activities);
    const totalProjectActivities = allActivities.length;
    const completedProjectActivities = allActivities.filter(a => a.completed).length;
    const projectProgress = totalProjectActivities > 0
      ? Math.round((completedProjectActivities / totalProjectActivities) * 100)
      : 0;

    res.render('public/project-details', {
      project: {
        ...project,
        stages: stagesWithProgress,
        progress: projectProgress
      }
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do projeto:', error);
    res.status(500).render('error', { message: 'Erro ao carregar detalhes do projeto' });
  }
};

module.exports = {
  getProjects,
  getProjectDetails
};

